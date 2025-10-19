param name string = '${resourceGroup().name}-containerapp-client'
param location string = resourceGroup().location
param managedEnvironmentResourceId string

param imageName string
param containerName string
param apiUrl string

param clerkPublishableKey string
@secure()
param clerkSecretKey string

@secure()
param cookieSecret string

param registryUrl string
param registryUsername string
@secure()
param registryPassword string

var registryPasswordName = 'container-registry-password'
var clerkSecretName = 'clerk-api-secret'
var cookieSecretName = 'cookie-secret'

resource containerApp 'Microsoft.App/containerapps@2024-10-02-preview' = {
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
          passwordSecretRef: registryPasswordName
        }
      ]
      secrets: [
        {
          name: registryPasswordName
          value: registryPassword
        }
        {
          name: clerkSecretName
          value: clerkSecretKey
        }
        {
          name: cookieSecretName
          value: cookieSecret
        }
      ]
    }
    template: {
      containers: [
        {
          image: imageName
          name: containerName
          // https://learn.microsoft.com/en-us/azure/container-apps/containers#configuration
          resources: {
            cpu: any('0.5')
            memory: '1.0Gi'
          }
          env: [
            {
              name: 'API_URL'
              value: apiUrl
            }
            {
              name: 'CLERK_PUBLISHABLE_KEY'
              value: clerkPublishableKey
            }
            {
              name: 'CLERK_SECRET_KEY'
              secretRef: clerkSecretName
            }
            {
              name: 'COOKIE_SECRET'
              secretRef: cookieSecretName
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
        // 30 minutes
        cooldownPeriod: 1800
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
