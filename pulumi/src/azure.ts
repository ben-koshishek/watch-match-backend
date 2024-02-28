import * as pulumi from '@pulumi/pulumi';
import * as azure from '@pulumi/azure-native';
import { location, sshPublicKey } from './config';

export const resourceGroup = new azure.resources.ResourceGroup(
  'myResourceGroup',
  {
    location: location,
  },
);

export const cluster = new azure.containerservice.ManagedCluster('myCluster', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  agentPoolProfiles: [
    {
      count: 1,
      vmSize: 'Standard_B2s',
      mode: 'System',
      name: 'agentpool',
    },
  ],
  dnsPrefix: `${pulumi.getStack()}-kube`,
  linuxProfile: {
    adminUsername: 'adminuser',
    ssh: {
      publicKeys: [{ keyData: sshPublicKey }],
    },
  },
  identity: { type: 'SystemAssigned' },
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
