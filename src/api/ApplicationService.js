import { IframeMessageProxy } from 'iframe-message-proxy'

export class ApplicationService {
  static getApplication = async () => {
    const { response: application } = await IframeMessageProxy.sendMessage({
      action: 'getApplication',
    })
    return application
  }

  static ping = async () => {
    try {
      const { response } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'get',
            uri: '/ping',
          },
        },
      })

      return response !== undefined || false
    } catch (error) {
      return false
    }
  }
  static getContacts = async () => {
    try {
      const {
        response: { items },
      } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'get',
            uri: '/contacts',
          },
        },
      })

      return items
    } catch (error) {
      console.error(`Error to load ${error}`)
      return []
    }
  }

  static getThreads = async () => {
    try {
      const {
        response: { items },
      } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'get',
            uri: '/threads',
          },
        },
      })

      return items
    } catch (error) {
      console.error(`Error to load ${error}`)
      return []
    }
  }
}
