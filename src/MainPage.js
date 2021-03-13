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
  const [isRouter, setIsRouter] = useState(false)
  const [botFields, setBotFields] = useState({
    flowId: '',
    deskId: '',
    context: 'false',
  })
  const checkRequiredFields = (data) => {
    console.log(!data.states.find((e) => e.id.includes('desk')).id)
    if (!data.states.find((e) => e.id.includes('desk')).id)
      throw new Error('What is desk block?')

    return true
  }

  const fetchApi = async () => {
    try {
      const application = await service.getApplication()
      setIsRouter(
        application.applicationJson.settings.hasOwnProperty('children')
      )

      if (
        application &&
        !application.applicationJson.settings.hasOwnProperty('children') &&
        checkRequiredFields(application.applicationJson.settings.flow)
      ) {
        const desk = application.applicationJson.settings.flow.states.find(
          (e) => e.id.includes('desk')
        ).id

        setBotFields({
          flowId: application.applicationJson.settings.flow.id,
          deskId: desk,
          context:
            application.applicationJson.settings.flow.configuration.hasOwnProperty(
              'builder:useTunnelOwnerContext'
            ) || false,
        })
      }
    } catch (error) {
      console.error('erro fetchApi ' + error)
    }
  }

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
        setTicket(await service.createTicket(contactId))
      })
    } else {
      commomService.withLoading(async () => {
        await service.setState(
          botFields.flowId,
          botFields.deskId,
          contact.identity
        )
        setTicket(await service.createTicket(contact.identity))
      })
    }
  }

  useEffect(() => {
    commomService.withLoading(async () => {
      await fetchApi()
    })
  }, [service, commomService])
  const Test = () => {
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

        {contact && (
          <>
            <br />
            <ContactCard contact={contact} onUpdate={() => {}} />
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
        )}
        <br />
        {ticket && <TicketCard data={ticket} />}
      </div>
    )
  }

  return !isRouter ? <Test /> : <>Router</>
}
MainPage.propTypes = {
  service: PropTypes.elementType.isRequired,
  commomService: PropTypes.elementType.isRequired,
}
export default MainPage
