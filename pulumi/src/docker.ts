import { dockerhubPassword, imageName } from './config';
import * as docker from '@pulumi/docker';
import * as pulumi from '@pulumi/pulumi';

// Build and push the Docker image
export const myImage = new docker.Image(imageName, {
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
