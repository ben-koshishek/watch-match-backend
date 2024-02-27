import * as pulumi from '@pulumi/pulumi';
import * as azure from '@pulumi/azure-native';
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();

const location = config.get('location') || 'germanywestcentral';

const sshPublicKey = config.require('sshPublicKey');

const resourceGroup = new azure.resources.ResourceGroup('myResourceGroup', {
  location: location,
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
const kubeconfig = pulumi
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
          containers: [
            {
              name: 'nodejs-app',
              image: 'nyunoshev/wmb',
              env: [
                { name: 'DB_HOST', value: 'postgres' },
                { name: 'DB_PORT', value: '5432' },
                { name: 'DB_USERNAME', value: 'postgres' },
                { name: 'DB_PASSWORD', value: 'password' },
                { name: 'DB_DATABASE', value: 'mydatabase' },
                { name: 'ENV', value: 'dev' },
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
