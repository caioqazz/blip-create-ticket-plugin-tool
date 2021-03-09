import React, { useEffect, useState } from 'react'
import 'blip-toolkit/dist/blip-toolkit.css'
import PropTypes from 'prop-types'
import {
  Form,
  Col,
  Button,
  InputGroup,
  FormControl,
  Row,
  Card,
} from 'react-bootstrap'
import { FiX } from 'react-icons/fi'

function MainPage({ service, commomService }) {
  const [application, setApplication] = useState({})
  const [contactId, setContactId] = useState(
    'da525ccb-61bc-4abf-80af-3abb6fd32a8a@tunnel.msging.net'
  )
  const [contact, setContact] = useState()
  const [tunnel, setTunnel] = useState()
  const [extras, setExtras] = useState({})
  const [botFields, setBotFields] = useState({
    flowId: '',
    deskId: '',
    context: 'false',
  })

  const fetchApi = async () => {
    // setContacts(await service.getContacts())
    try {
      const application = await service.getApplication()
      console.log(application)
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
      setApplication(application)
    } catch (error) {}
  }
  const handleContactLoad = async (e) => {
    e.preventDefault()
    if (botFields.context === 'true' && contactId.includes('tunnel'))
      commomService.withLoading(async () => {
        const tunnel = await service.getTunnelInfo(contactId)
        setTunnel(tunnel)
        setContact(await service.getContact(tunnel.originator, tunnel.owner))
      })
    else
      commomService.withLoading(async () => {
        setContact(await service.getContact(contactId))
      })
  }

  const handleAddExtras = () => {
    setExtras({
      ...extras,
      [`key${Object.keys(extras).length}`]: {
        key: '',
        value: '',
        actived: true,
      },
    })
    console.log(extras)
  }

  const handleDeleteExtras = (extrasKey) => {
    console.log(extrasKey)
  }

  const handleCreateTicket = () => {
    if (botFields.context === 'true' && contactId.includes('tunnel')) {
      console.log('entrou')
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
        await service.createTicket(contactId)
      })
    } else
      commomService.withLoading(async () => {
        await service.createTicket(contact.identity)
        await service.setState(
          botFields.flowId,
          botFields.deskId,
          contact.identity
        )
      })
  }

  useEffect(() => {
    commomService.withLoading(async () => {
      // new BlipTabs('tab-nav')
      await fetchApi()
    })
  }, [])

  return (
    <div id="tab-nav" className="bp-tabs-container">
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
          <Card>
            <Card.Body>
              <Form>
                <h5>Contact Information</h5>
                <Form.Label>Contact Name</Form.Label>
                <Form.Control
                  type="text"
                  value={contact.name}
                  onChange={(e) => {
                    setContact({ ...contact, name: e.target.value })
                  }}
                  required
                />
                <Form.Label>Contact Email</Form.Label>
                <Form.Control
                  type="text"
                  value={contact.email}
                  onChange={(e) => {
                    setContact({ ...contact, email: e.target.value })
                  }}
                  required
                />
                <Form.Label>Last Message Date</Form.Label>
                <Form.Control
                  type="text"
                  value={contact.lastMessageDate}
                  readOnly
                  required
                />
                <b>Extras</b>
                <Button type="success" onClick={handleAddExtras}>
                  +
                </Button>
                <br />
                {Object.keys(contact.extras).map((k, i) => {
                  return (
                    <Form.Row key={k}>
                      <Form.Group as={Col} md="5" controlId="formGridKey">
                        <Form.Label>{k}</Form.Label>
                      </Form.Group>
                      <Form.Group as={Col} md="5" controlId="formGridKey">
                        <Form.Control
                          type="text"
                          value={contact.extras[k]}
                          onChange={(e) => {
                            setContact({
                              ...contact,
                              extras: { ...extras, [`${k}`]: e.target.value },
                            })
                          }}
                          required
                        />
                      </Form.Group>
                      <Form.Group as={Col} md="2" controlId="formGridRemove">
                        <Form.Label></Form.Label>
                        <br />
                        <FiX
                          className="extras-remove-item"
                          size={32}
                          onClick={() => {
                            handleDeleteExtras(k)
                          }}
                        />
                      </Form.Group>
                    </Form.Row>
                  )
                })}

                <Button className="float-right" type="submit">
                  Update
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <hr />
          <Button
            className="float-right"
            type="submit"
            block
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
    </div>
  )
}
MainPage.propTypes = {
  service: PropTypes.elementType.isRequired,
  commomService: PropTypes.elementType.isRequired,
}
export default MainPage
