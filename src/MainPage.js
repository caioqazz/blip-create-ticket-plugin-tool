import React, { useEffect, useState } from 'react'
import 'blip-toolkit/dist/blip-toolkit.css'
import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import ContactCard from './ContactCard'
import TicketCard from './TicketCard'

function MainPage({ service, commomService }) {
  const [contactId, setContactId] = useState(
    '975442ef-1417-4a03-8a59-253a1d586b61@tunnel.msging.net'
  )
  const [contact, setContact] = useState()
  const [ticket, setTicket] = useState()
  const [tunnel, setTunnel] = useState()
  const [botFields, setBotFields] = useState({
    flowId: '',
    deskId: '',
    context: 'false',
  })

  const fetchApi = async () => {
    try {
      const application = await service.getApplication()
      setBotFields({
        flowId: application.applicationJson.settings.flow.id,
        deskId: application.applicationJson.settings.flow.states.find((e) =>
          e.id.includes('desk')
        ).id,
        context: application.applicationJson.settings.flow.configuration.hasOwnProperty(
          'builder:useTunnelOwnerContext'
        )
          ? application.applicationJson.settings.flow.configuration[
              'builder:useTunnelOwnerContext'
            ]
          : 'false',
      })
    } catch (error) {}
  }
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const handleContactLoad = async (e) => {
    e.preventDefault()
    setTicket()

    if (botFields.context === 'true' && contactId.includes('tunnel'))
      commomService.withLoading(async () => {
        const contactTunnel = await service.getTunnelInfo(contactId)
        setTunnel(contactTunnel)
        setContact(
          await service.getContact(
            contactTunnel.originator,
            contactTunnel.owner
          )
        )
      })
    else
      commomService.withLoading(async () => {
        setContact(await service.getContact(contactId))
      })
  }

  const handleCreateTicket = () => {
    if (botFields.context === 'true' && contactId.includes('tunnel')) {
      commomService.withLoading(async () => {
        await service.setMasterState(
          tunnel.originator,
          tunnel.destination,
          tunnel.owner
        )
        await service.setState(
          botFields.flowId,
          botFields.deskId,
          contact.identity,
          tunnel.owner
        )
      }, 5000)
      commomService.withLoading(async () => {
        setTicket(await service.createTicket(contactId))
      })
    } else {
      commomService.withLoading(async () => {
        await service.setState(
          botFields.flowId,
          botFields.deskId,
          contact.identity
        )
      }, 5000)
      commomService.withLoading(async () => {
        setTicket(await service.createTicket(contact.identity))
      })
    }
  }

  useEffect(() => {
    commomService.withLoading(async () => {
      await fetchApi()
    })
  }, [])

  return (
    <div id="tab-nav" className="bp-tabs-container">
      {/* Contact id Form */}
      <Form
        onSubmit={(e) => {
          handleContactLoad(e)
        }}
      >
        <Form.Label>Contact Id</Form.Label>
        <Form.Control
          type="text"
          value={contactId}
          onChange={(e) => {
            setContactId(e.target.value)
          }}
          required
        />
        <br />
        <Button className="float-right" type="submit">
          Load
        </Button>
      </Form>

      {contact ? (
        <>
          <br />
          <ContactCard data={contact} onUpdate={() => {}} />
          <hr />
          <Button
            className="float-right"
            type="submit"
            variant="success"
            block
            style={{ display: ticket ? 'none' : '' }}
            onClick={() => {
              handleCreateTicket()
            }}
          >
            Create a Ticket
          </Button>
        </>
      ) : (
        <></>
      )}
      <br />
      {ticket ? <TicketCard data={ticket} /> : <></>}
    </div>
  )
}
MainPage.propTypes = {
  service: PropTypes.elementType.isRequired,
  commomService: PropTypes.elementType.isRequired,
}
export default MainPage
