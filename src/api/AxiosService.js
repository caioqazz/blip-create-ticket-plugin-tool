import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { AxiosCommomService } from './AxiosCommomService'

export class AxiosService {
  static headers
  static url

  static init(key, url) {
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: key,
    }
    this.url = url
  }

  static getThreads = async () => {
    const body = {
      id: uuidv4(),
      method: 'get',
      uri: '/threads',
    }
    try {
      const {
        data: { resource: items },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })
      return items.items
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error loading threads ${error}`)
      return []
    }
  }
  static getContact = async (contactIdentity, owner) => {
    const body = {
      id: uuidv4(),
      method: 'get',
      uri: `${owner ? `lime://${owner}` : ''}/contacts/${contactIdentity}`,
    }

    try {
      const {
        data: { resource },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })
      console.log(resource)

      if (resource === undefined) throw new Error('')

      return resource
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error loading contact ${error}`)
      return
    }
  }
  static getTunnelInfo = async (tunnel) => {
    const body = {
      id: uuidv4(),
      to: 'postmaster@tunnel.msging.net',
      uri: `/tunnels/${tunnel}`,
      method: 'get',
    }

    try {
      const {
        data: { resource },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })
      console.log(resource)

      return resource
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error loading contact ${error}`)
      return
    }
  }
  static createTicket = async (customerIdentity) => {
    const body = {
      id: uuidv4(),
      method: 'set',
      to: 'postmaster@desk.msging.net',
      uri: '/tickets',
      type: 'application/vnd.iris.ticket+json',
      resource: {
        customerIdentity: `${customerIdentity}`,
      },
    }

    try {
      const {
        data: { resource },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })

      if (!resource) throw new Error()

      return resource
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error create a ticket ${error}`)
      return
    }
  }
  static setState = async (flowId, stateId, contactId, owner) => {
    const body = {
      id: uuidv4(),
      method: 'set',
      to: 'postmaster@msging.net',
      uri:
        `${owner ? `lime://${owner}` : ''}` +
        `/contexts/${contactId}/stateid%40${flowId}`,
      type: 'text/plain',
      resource: `${stateId}`,
    }
    console.log('setState', body)
    try {
      const response = await axios.post(this.url, body, {
        headers: this.headers,
      })
      console.log(response)
      return response
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error setting state ${error}`)
      return
    }
  }
  static setMasterState = async (originator, destination, owner) => {
    const body = {
      id: uuidv4(),
      method: 'set',
      to: 'postmaster@msging.net',
      uri:
        `${owner ? `lime://${owner}` : ''}` +
        `/contexts/${originator}/master-state`,
      type: 'text/plain',
      resource: `${destination}`,
    }
    console.log('setMasterState', body)
    try {
      const response = await axios.post(this.url, body, {
        headers: this.headers,
      })
      console.log(response)
      return response
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error setting masterstate ${error}`)
      return
    }
  }
  static getContacts = async () => {
    const body = {
      id: uuidv4(),
      method: 'get',
      uri: '/contacts',
    }

    try {
      const {
        data: {
          resource: { items },
        },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })

      return items
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error loading contacts ${error}`)
      return []
    }
  }
  static getLastMessage = async (contactIdentity) => {
    const body = {
      id: uuidv4(),
      method: 'get',
      uri: `/threads/${contactIdentity}?take=100`,
    }
    try {
      const response = await axios.post(this.url, body, {
        headers: this.headers,
      })

      console.log(response)
      if (response.data.resource.items.length === 0) return 'More than 90 days'

      return response.data.resource.items.find(
        (e) => e.direction === 'received'
      ).date
    } catch (error) {
      console.error(`Error to get last message - ${error}`)
      return "Couldn't find"
    }
  }
  static getApplication = async () => {
    const body = {
      id: uuidv4(),
      method: 'get',
      uri: '/configuration/caller',
    }
    try {
      const {
        data: {
          resource: { items },
        },
      } = await axios.post(this.url, body, {
        headers: this.headers,
      })
      const application = items.find((e) => e.name === 'Application')
      return {
        ...application,
        shortName: application.caller.split('@')[0],
        applicationJson: JSON.parse(application.value),
      }
    } catch (error) {
      AxiosCommomService.showErrorToast(`Error loading application ${error}`)
      return { shortName: 'botId' }
    }
  }
}
