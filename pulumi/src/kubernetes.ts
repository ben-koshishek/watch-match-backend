import * as k8s from '@pulumi/kubernetes';
import { googleClientId, googleClientSecret } from './config';
import { kubeconfig } from './azure';

// Create a Kubernetes provider instance using the kubeconfig
const provider = new k8s.Provider('k8s-provider', {
  kubeconfig: kubeconfig,
});

// Deploy the PostgreSQL database using a Kubernetes Deployment
export const postgresDeployment = new k8s.apps.v1.Deployment(
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
export const appDeployment = new k8s.apps.v1.Deployment(
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
              imagePullPolicy: 'Always',
              env: [
                { name: 'DB_HOST', value: 'postgres' },
                { name: 'DB_PORT', value: '5432' },
                { name: 'DB_USERNAME', value: 'postgres' },
                { name: 'DB_PASSWORD', value: 'password' },
                { name: 'DB_DATABASE', value: 'mydatabase' },
                { name: 'ENV', value: 'dev' },
                {
                  name: 'GOOGLE_CLIENT_ID',
                  value: googleClientId,
                },
                {
                  name: 'GOOGLE_CLIENT_SECRET',
                  value: googleClientSecret,
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

export const postgresService = new k8s.core.v1.Service(
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

export const appService = new k8s.core.v1.Service(
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
