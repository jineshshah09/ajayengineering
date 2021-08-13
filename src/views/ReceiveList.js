import React, { Component } from "react";
import axios from "axios";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  Modal,
} from "react-bootstrap";

class ReceiveList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentOrders: [],
    };
  }

  componentDidMount = () => {
    this.getAllStockData();
  };

  getAllStockData = () => {
    axios
      .get(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/received/${this.props.activeSiteId}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          console.log("testtt", response);
          this.setState({
            currentOrders: response.data,
          });
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("There was an error!", error);
      });
  };

  verifyOrder = (id) => {
    let data = this.state.currentOrders[id];
    console.log("data", this.state.currentOrders[id]);
    axios
      .put(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/verify`,
        data,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          this.getAllStockData();
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  };

  render() {
    return (
      <>
        <Container fluid>
          {this.props.activeSiteId !== "" && (
            <div style={{ marginBottom: "10px" }}>
              <Button
                className="btn-fill pull-right"
                type="submit"
                variant="secondary"
                onClick={this.props.changeTableOrder}
              >
                Back to Current Stock
              </Button>
            </div>
          )}
          {this.state.currentOrders && this.state.currentOrders.length > 0 ? (
            this.state.currentOrders.map((item, index) => {
              return (
                <Row>
                  <Col md="12">
                    <Card>
                      <Card.Header>
                        <Card.Title as="h4" style={{ color: "blue" }}>
                          {
                            this.props.siteList[
                              this.props.siteList.findIndex(
                                (list) => list.id == item.fromSiteId
                              )
                            ].name
                          }{" "}
                          ->{" "}
                          {
                            this.props.siteList[
                              this.props.siteList.findIndex(
                                (list) => list.id == this.props.activeSiteId
                              )
                            ].name
                          }
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Row>
                            <Col className="pr-1" md="4">
                              <Form.Group>
                                <label>Vehical No.</label>
                                <Form.Control
                                  type="text"
                                  name="vehicalNo"
                                  disabled={true}
                                  value={item.vehicleNo}
                                ></Form.Control>
                              </Form.Group>
                            </Col>
                            <Col className="pl-1" md="4">
                              <Form.Group>
                                <label>Driver Licence No.</label>
                                <Form.Control
                                  type="text"
                                  name="licenceNo"
                                  disabled={true}
                                  value={item.driverDL}
                                ></Form.Control>
                              </Form.Group>
                            </Col>
                            <Col className="pr-1" md="4">
                              <Form.Group>
                                <label>Date</label>
                                <Form.Control
                                  type="text"
                                  name="date"
                                  disabled={true}
                                  value={item.date}
                                ></Form.Control>
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="clearfix"></div>
                        </Form>
                      </Card.Body>
                      <Card.Footer className="table-full-width table-responsive px-0">
                        <Table className="table-hover table-striped">
                          <thead>
                            <tr>
                              <th className="border-0">ID</th>
                              <th className="border-0">Item Name</th>
                              <th className="border-0">Dimension</th>
                              <th className="border-0">Description</th>
                              <th className="border-0">Qty.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.TransferOrderDetails &&
                              item.TransferOrderDetails.length > 0 &&
                              item.TransferOrderDetails.map((data, i) => {
                                return (
                                  <tr>
                                    <td>{i + 1}</td>
                                    <td>{data.Stock.item}</td>
                                    <td>{data.Stock.dimension}</td>
                                    <td>{data.Stock.description}</td>
                                    <td>{data.qty}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </Table>
                        <div class="col-auto">
                          <Button
                            className="btn-fill pull-right"
                            type="submit"
                            variant="primary"
                            onClick={() => this.verifyOrder(index)}
                          >
                            Verify
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                </Row>
              );
            })
          ) : (
            <h3 style={{ textAlign: "center" }}>No receive orders found</h3>
          )}
        </Container>
      </>
    );
  }
}

export default ReceiveList;
