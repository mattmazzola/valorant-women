param name string = '${resourceGroup().name}-containerapp-client'
param location string = resourceGroup().location
param managedEnvironmentResourceId string

param imageName string
param containerName string
param apiUrl string

param registryUrl string
param registryUsername string
@secure()
param registryPassword string

var registryPassworldName = 'container-registry-password'

resource containerApp 'Microsoft.App/containerapps@2022-03-01' = {
  name: name
  location: location
  properties: {
    managedEnvironmentId: managedEnvironmentResourceId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
      }
      registries: [
        {
          server: registryUrl
          username: registryUsername
          passwordSecretRef: registryPassworldName
        }
      ]
      secrets: [
        {
          name: registryPassworldName
          value: registryPassword
        }
      ]
    }
    template: {
      containers: [
        {
          image: imageName
          name: containerName
          resources: {
            cpu: any('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'API_URL'
              value: apiUrl
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
