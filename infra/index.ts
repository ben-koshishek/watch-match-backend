import * as pulumi from '@pulumi/pulumi';
import * as azure from '@pulumi/azure-native';
import * as k8s from '@pulumi/kubernetes';
import * as docker from '@pulumi/docker';

const config = new pulumi.Config();

const location = config.get('location') || 'germanywestcentral';

const sshPublicKey = config.require('sshPublicKey');
const dockerhubPassword = config.requireSecret('dockerhubPassword');

const resourceGroup = new azure.resources.ResourceGroup('myResourceGroup', {
  location: location,
});

const imageName = 'wmb';

// Build and push the Docker image
const myImage = new docker.Image(imageName, {
  imageName: pulumi.interpolate`nyunoshev/${imageName}:latest`,
  build: {
    context: '../',
    platform: 'linux/amd64',
  },
  registry: {
    server: 'docker.io',
    username: 'nyunoshev',
    password: dockerhubPassword,
  },
});

const cluster = new azure.containerservice.ManagedCluster('myCluster', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  agentPoolProfiles: [
    {
      count: 1, // Start with a single node for Dev/Test
      vmSize: 'Standard_B2s', // Choose a suitable VM size for Dev/Test
      mode: 'System',
      name: 'agentpool',
    },
  ],
  dnsPrefix: `${pulumi.getStack()}-kube`,
  linuxProfile: {
    adminUsername: 'adminuser',
    ssh: {
      publicKeys: [
        {
          keyData: sshPublicKey,
        },
      ],
    },
  },
  identity: {
    type: 'SystemAssigned',
  },
});

// Use the AKS cluster's kubeconfig to interact with the cluster
export const kubeconfig = pulumi
  .all([cluster.name, resourceGroup.name])
  .apply(([clusterName, rgName]) =>
    azure.containerservice
      .listManagedClusterUserCredentials({
        resourceGroupName: rgName,
        resourceName: clusterName,
      })
      .then((creds) =>
        Buffer.from(creds.kubeconfigs[0].value, 'base64').toString(),
      ),
  );

// Create a Kubernetes provider instance using the kubeconfig
const provider = new k8s.Provider('k8s-provider', {
  kubeconfig: kubeconfig,
});

// Deploy the PostgreSQL database using a Kubernetes Deployment
const postgresDeployment = new k8s.apps.v1.Deployment(
  'postgres-deployment',
  {
    metadata: { name: 'postgres' },
    spec: {
      selector: { matchLabels: { app: 'postgres' } },
      replicas: 1,
      template: {
        metadata: { labels: { app: 'postgres' } },
        spec: {
          containers: [
            {
              name: 'postgres',
              image: 'postgres:13',
              env: [
                { name: 'POSTGRES_DB', value: 'mydatabase' },
                { name: 'POSTGRES_USER', value: 'postgres' },
                { name: 'POSTGRES_PASSWORD', value: 'password' },
              ],
              ports: [{ containerPort: 5432 }],
              readinessProbe: {
                exec: {
                  command: ['pg_isready', '-U', 'postgres'],
                },
                initialDelaySeconds: 5,
                periodSeconds: 5,
              },
            },
          ],
        },
      },
    },
  },
  { provider },
);

// Deploy the Node.js application using a Kubernetes Deployment
const appDeployment = new k8s.apps.v1.Deployment(
  'app-deployment',
  {
    metadata: { name: 'nodejs-app' },
    spec: {
      selector: { matchLabels: { app: 'nodejs-app' } },
      replicas: 1,
      template: {
        metadata: { labels: { app: 'nodejs-app' } },
        spec: {
          initContainers: [
            {
              name: 'wait-for-postgres',
              image: 'busybox',
              command: [
                'sh',
                '-c',
                'until nc -z postgres 5432; do echo waiting for postgres; sleep 2; done;',
              ],
            },
          ],
          containers: [
            {
              name: 'nodejs-app',
              image: 'nyunoshev/wmb:latest',
              env: [
                { name: 'DB_HOST', value: 'postgres' },
                { name: 'DB_PORT', value: '5432' },
                { name: 'DB_USERNAME', value: 'postgres' },
                { name: 'DB_PASSWORD', value: 'password' },
                { name: 'DB_DATABASE', value: 'mydatabase' },
                { name: 'ENV', value: 'dev' },
                {
                  name: 'GOOGLE_CLIENT_ID',
                  value: config.require('googleClientId'),
                },
                {
                  name: 'GOOGLE_CLIENT_SECRET',
                  value: config.require('googleClientSecret'),
                },
                {
                  name: 'GOOGLE_REDIRECT_URI',
                  value: 'https://developers.google.com/oauthplayground',
                },
              ],
              ports: [{ containerPort: 3000 }],
            },
          ],
        },
      },
    },
  },
  { provider, dependsOn: [postgresDeployment] },
);

const postgresService = new k8s.core.v1.Service(
  'postgres-service',
  {
    metadata: {
      name: 'postgres',
    },
    spec: {
      type: 'ClusterIP', // Default type, suitable for internal communication
      ports: [
        {
          port: 5432, // PostgreSQL default port
          targetPort: 5432, // Container port
        },
      ],
      selector: {
        app: 'postgres', // Should match the labels of your PostgreSQL pods
      },
    },
  },
  { provider },
);

const appService = new k8s.core.v1.Service(
  'app-service',
  {
    metadata: {
      name: 'nodejs-app-service',
    },
    spec: {
      type: 'LoadBalancer',
      ports: [
        {
          port: 80,
          targetPort: 3000,
        },
      ],
      selector: appDeployment.spec.template.metadata.labels,
    },
  },
  { provider },
);

export const appServiceIp = appService.status.apply(
  (status) => status.loadBalancer.ingress[0].ip,
);
