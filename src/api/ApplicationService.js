import { IframeMessageProxy } from 'iframe-message-proxy'
import { CommomService } from './CommomService'
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
  static wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  static mergeContact = async (contact) => {
    try {
      const response = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'merge',
            type: 'application/vnd.lime.contact+json',
            uri: '/contacts',
            resource: contact,
          },
        },
      })
      console.log(response)
      return response
    } catch (error) {
      console.error(`Error to load ${error}`)
      return []
    }
  }
  static getContact = async (contactIdentity, owner) => {
    console.log({
      content: {
        destination: 'MessagingHubService',
        command: {
          method: 'get',
          uri: `${owner ? `lime://${owner}` : ''}/contacts/${contactIdentity}`,
        },
      },
    })
    try {
      const { response } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'get',
            uri: `${
              owner ? `lime://${owner}` : ''
            }/contacts/${contactIdentity}`,
          },
        },
      })
      if (response === undefined) throw new Error('')
      console.log('getContact ' + JSON.stringify(response))
      return response
    } catch (error) {
      CommomService.showErrorToast(`Error loading contact ${error}`)
      return
    }
  }
  static mergeContact = async (contact, owner) => {
    try {
      const response = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'merge',
            type: 'application/vnd.lime.contact+json',
            uri: `${owner ? `lime://${owner}` : ''}/contacts`,
            resource: contact,
          },
        },
      })
      await this.wait(4000)
      console.log('mergeContact ' + JSON.stringify(response))
      //if (response === undefined) throw new Error('')
      return true
    } catch (error) {
      CommomService.showErrorToast(`Error loading contact ${error}`)
      return
    }
  }
  static getTunnelInfo = async (tunnel) => {
    try {
      const { response } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            to: 'postmaster@tunnel.msging.net',
            uri: `/tunnels/${tunnel}`,
            method: 'get',
          },
        },
      })
      // if (response === undefined) throw new Error('')
      console.log('getTunnelInfo ' + JSON.stringify(response))
      return response
    } catch (error) {
      CommomService.showErrorToast(`Error getTunnelInfo ${error}`)
      return
    }
  }

  static createTicket = async (customerIdentity) => {
    try {
      const { response } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'set',
            to: 'postmaster@desk.msging.net',
            uri: '/tickets',
            type: 'application/vnd.iris.ticket+json',
            resource: {
              customerIdentity: `${customerIdentity}`,
            },
          },
        },
      })
      //   if (!resource) throw new Error()
      console.log('createTicket ' + JSON.stringify(response))
      return response
    } catch (error) {
      CommomService.showErrorToast(`Error createTicket ${error}`)
      return
    }
  }
  static setState = async (flowId, stateId, contactId, owner) => {
    try {
      const response = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'set',
            to: 'postmaster@msging.net',
            uri:
              `${owner ? `lime://${owner}` : ''}` +
              `/contexts/${contactId}/stateid%40${flowId}`,
            type: 'text/plain',
            resource: `${stateId}`,
          },
        },
      })
      //   if (!resource) throw new Error()
      console.log('setState ' + JSON.stringify(response))
      await this.wait(3000)
      return response
    } catch (error) {
      CommomService.showErrorToast(`Error setting state ${error}`)
      return
    }
  }

  static setMasterState = async (originator, destination, owner) => {
    try {
      const response = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            method: 'set',
            to: 'postmaster@msging.net',
            uri:
              `${owner ? `lime://${owner}` : ''}` +
              `/contexts/${originator}/master-state`,
            type: 'text/plain',
            resource: `${destination}`,
          },
        },
      })
      //   if (!resource) throw new Error()
      console.log('setMasterState ' + JSON.stringify(response))
      await this.wait(5000)
      return response
    } catch (error) {
      CommomService.showErrorToast(`Error setting masterstate ${error}`)
      return
    }
  }

  static sendMessage = async (contactId, message) => {
    console.log('sendMessage ')
    try {
      IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
          destination: 'MessagingHubService',
          command: {
            to: contactId,
            type: 'text/plain',
            content: message,
          },
        },
      })
      //   if (!resource) throw new Error()
      console.log('sendMessage ')
      await this.wait(1000)
      return true
    } catch (error) {
      CommomService.showErrorToast(`Error setting masterstate ${error}`)
      return
    }
  }
}
