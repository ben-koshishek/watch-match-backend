import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

export const imageName = 'wmb';
export const location = config.get('location') || 'germanywestcentral';
export const sshPublicKey = config.require('sshPublicKey');
export const dockerhubPassword = config.requireSecret('dockerhubPassword');
export const googleClientId = config.require('googleClientId');
export const googleClientSecret = config.require('googleClientSecret');
