import React, { useState } from 'react'
import 'blip-toolkit/dist/blip-toolkit.css'
import PropTypes from 'prop-types'
import { Form, Col, Card } from 'react-bootstrap'

function TicketCard({ data }) {
  const [ticket, setTicket] = useState(data)
  return (
    <Card border="success">
      <Card.Body>
        <Form>
          <h5>Ticket Information</h5>
          {Object.keys(ticket).map((k) => {
            return (
              <Form.Row key={k}>
                <Form.Group as={Col} md="5" controlId="formGridKey">
                  <Form.Label>{k}</Form.Label>
                </Form.Group>
                <Form.Group as={Col} md="5" controlId="formGridKey">
                  <Form.Control
                    type="text"
                    value={typeof ticket[k] !== 'object'
                      ? ticket[k]
                      : JSON.stringify(ticket[k])}
                    onChange={(e) => {
                      setTicket({
                        ...ticket,
                        [`${k}`]: e.target.value,
                      })
                    }}
                    required
                    readOnly={true}
                  />
                </Form.Group>
              </Form.Row>
            )
          })}
        </Form>
      </Card.Body>
    </Card>
  )
}
TicketCard.propTypes = {
  data: PropTypes.object.isRequired,
}

export default TicketCard
