import React, { useEffect, useState } from 'react'
import 'blip-toolkit/dist/blip-toolkit.css'
import PropTypes from 'prop-types'
import { Form, Button, Alert } from 'react-bootstrap'
import ContactCard from './ContactCard'
import TicketCard from './TicketCard'
import { AiOutlineWarning } from 'react-icons/ai'
function MainPage({ service, commomService, onApplicationError }) {
  const [contactId, setContactId] = useState(
    'f7ca8fdc-5bea-4e6a-b128-bfe2a65516f7@tunnel.msging.net'
  )
  const [contact, setContact] = useState()
  const [ticket, setTicket] = useState()
  const [tunnel, setTunnel] = useState('')
  const [isRouter, setIsRouter] = useState(false)
  const [botFields, setBotFields] = useState({
    flowId: '',
    deskId: '',
    context: 'false',
  })

  const checkRequiredFields = (settings) => {
    if (!settings.flow.states.find((e) => e.id.includes('desk'))) {
      commomService.showErrorToast('Could not find desk block in your flow')
      throw new Error('Could not find desk block in your flow')
    }

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
        checkRequiredFields(application.applicationJson.settings)
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
      console.error('Error fetchApi ' + error)
      onApplicationError(false)
    }
  }

  const handleContactLoad = async (e) => {
    e.preventDefault()
    setTicket(undefined)

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

  const handleContactUpdate = (e, updatedContact) => {
    e.preventDefault()
    commomService.withLoading(async () => {
      if (await service.mergeContact(updatedContact)) {
        setContact(await service.getContact(contactId))
      }
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

  const BuilderBox = () => {
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
            <ContactCard
              data={contact}
              onUpdate={(e, data) => {
                handleContactUpdate(e, data)
              }}
            />
            <hr />
            <Form.Check
              style={{ display: ticket ? 'none' : '', padding: '10px' }}
              type="checkbox"
              label="Check me out"
            />

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
  const RouterBox = () => {
    return (
      <Alert variant="danger">
        <AiOutlineWarning size="30" />
        This tool does not work on the router, please{' '}
        <b>use it on the customer service subbot!</b>
      </Alert>
    )
  }

  return !isRouter ? <BuilderBox /> : <RouterBox />
}
MainPage.propTypes = {
  service: PropTypes.elementType.isRequired,
  onApplicationError: PropTypes.elementType.isRequired,
  commomService: PropTypes.elementType.isRequired,
}
export default MainPage
