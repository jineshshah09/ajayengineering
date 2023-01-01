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
  Spinner
} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { REACT_API_ENDPOINT } from '../configUrl';

class ReceiveList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentOrders: [],
      openModal: false,
      password: '',
      verifyIndex: '',
      loading: false
    };
  }

  componentDidMount = () => {
    this.getAllStockData();
  };

  getAllStockData = () => {
    axios
      .get(
        `${REACT_API_ENDPOINT}/api/received/${this.props.activeSiteId}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            currentOrders: response.data.reverse(),
          });
        }
      })
      .catch((error) => {
        if (error.response.status == 401) {
          localStorage.clear();
          window.location.replace("/admin/login");
        } else if (
          error.response.status == 403 &&
          error.response?.data?.message
        ) {
          toast.error(error.response.data.message);
        } else toast.error("Error while fetching data");
        console.error("There was an error!", error);
      });
  };

  verifyOrder = (id) => {
    this.setState({ loading: true, openModal: false });
    let data = { ...this.state.currentOrders[id], "password": this.state.password };
    axios
      .put(
        `${REACT_API_ENDPOINT}/api/verify`,
        data,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          toast.success("Order verified successfully!!");
          this.handleModalClose();
          this.getAllStockData();
        }
      })
      .catch((error) => {
        if (error.response.status == 401) {
          localStorage.clear();
          window.location.replace("/admin/login");
        } else if (
          error.response.status == 403 &&
          error.response?.data?.message
        ) {
          toast.error(error.response.data.message);
        } else toast.error("Error while verifing order")
        console.error("There was an error!", error);
        this.setState({ loading: false });
      });
  };

  handleModalOpen = (id) => {
      this.setState({
        openModal: true,
        verifyIndex: id
      });
  };

  handleModalClose = () => {
    this.setState({
      openModal: false,
      password: '',
      verifyIndex: '',
      loading: false
    });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.verifyOrder(this.state.verifyIndex)
    }
  }

  render() {
    return (
      <>
        <Container fluid>
          <br />
          {this.state.loading &&
            <div style={{ position: "fixed", top: "0", left: "0", background: "#666", opacity: "0.8", zIndex: "998", height: "100%", width: "100%" }}>
              <Spinner animation="border" style={{ position: "absolute", left: "50%", top:"50%" }}/>
            </div>
          }
          
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
                          {item.challanUrl && item.challanUrl !== "" &&
                            <a
                              href={`https://ajayeng-assets-prd.s3.ap-south-1.amazonaws.com/${item.challanUrl}`}
                              target="_blank"
                              style={{ right: "25px", position: "absolute", color: "blue" }}
                            >
                              View Challan
                            </a>
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
                                <label>Challan No.</label>
                                <Form.Control
                                  type="text"
                                  name="challanNo"
                                  disabled={true}
                                  value={item.challanNo}
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
                        {item.status !== "received" &&
                          <div class="col-auto">
                            <Button
                              className="btn-fill pull-right"
                              type="submit"
                              variant="primary"
                              onClick={() => this.handleModalOpen(index)}
                            >
                              Verify
                            </Button>
                        </div>
                        }
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
        <Modal
          show={this.state.openModal}
          onHide={this.handleModalClose}
          // backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Are you sure to accept this order?
              <Row className="pt-3">
                <Col className="pr-1" md="12">
                  <Form.Group>
                    <Form.Control
                      placeholder="Enter Password"
                      type="password"
                      name="password"
                      value={this.state.password}
                      onChange={this.handleChange}
                      onKeyDown={this.onKeyDown}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button
              variant="primary"
              type="submit"
              onClick={() => this.verifyOrder(this.state.verifyIndex)}
            >
              Yes, I want to verify
            </Button>
            <Button
              variant="danger"
              type="submit"
              onClick={this.handleModalClose}
            >
              No, I don't want to verify
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer />
      </>
    );
  }
}

export default ReceiveList;
