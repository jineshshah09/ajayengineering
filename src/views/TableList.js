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

class TableList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentItems: [],
      addNewItem: false,
      addTask: true,
      item: "",
      dimension: "",
      description: "",
      qty: "",
      ownership: "",
      remark: "",
      siteName: "",
      inChangePerson: "",
      contactNo: "",
      Address: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
    };
  }

  componentDidMount = () => {
    if (this.props.activeSiteId !== "") {
      this.getAllStockData(this.props.activeSiteId);
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.activeSiteId !== this.props.activeSiteId) {
      this.getAllStockData(nextProps.activeSiteId);
    }
  };

  getAllStockData = (id) => {
    axios
      .get(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/stock/${id}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          console.log("testtt", response);
          this.setState({
            currentItems: response.data,
          });
          if (activeSiteId == "" && response.data.length > 0) {
            this.setState({
              activeSiteId: response.data[0].id,
            });
          }
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("There was an error!", error);
      });
  };

  allowAddProduct = () => {
    this.setState({
      addNewItem: true,
    });
  };

  cancleAddProduct = () => {
    this.setState({
      addNewItem: false,
      item: "",
      dimension: "",
      description: "",
      qty: "",
      ownership: "",
      remark: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
    });
  };

  addProductInStock = () => {
    const data = {
      item: this.state.item,
      dimension: this.state.dimension,
      description: this.state.description,
      qty: this.state.qty,
      ownership: this.state.ownership,
      remark: this.state.remark,
      date: this.state.date,
      amount: this.state.amount,
      SiteId: this.props.activeSiteId,
    };
    axios
      .post(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/stock`,
        data,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            addNewItem: false,
            item: "",
            dimension: "",
            description: "",
            qty: "",
            ownership: "",
            remark: "",
            date: new Date().toISOString().split("T")[0],
            amount: "",
          });
          this.getAllStockData(this.props.activeSiteId);
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("There was an error!", error);
      });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
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
                onClick={this.allowAddProduct}
              >
                + ADD NEW ITEM
              </Button>
              <Button
                className="btn-fill pull-right"
                type="submit"
                variant="secondary"
                onClick={this.props.changeSendOrder}
                style={{ marginLeft: "10px" }}
              >
                Send
              </Button>
              <Button
                className="btn-fill pull-right"
                type="submit"
                variant="secondary"
                onClick={this.props.changeReceiveOrder}
                style={{ marginLeft: "10px" }}
              >
                Receive
              </Button>
              <Button
                className="btn-fill pull-right"
                type="submit"
                variant="secondary"
                onClick={this.props.changePurchaseOrder}
                style={{ marginLeft: "10px" }}
              >
                Purchase Order
              </Button>
            </div>
          )}
          {this.state.addNewItem && (
            <Row>
              <Col md="12">
                <Card>
                  <Card.Body>
                    <Row>
                      <Col className="pr-1" md="4">
                        <Form.Group>
                          <label>Item Name</label>
                          <Form.Control
                            placeholder="Enter Item Name"
                            type="text"
                            name="item"
                            value={this.state.item}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Dimension</label>
                          <Form.Control
                            placeholder="Enter Dimension"
                            type="text"
                            name="dimension"
                            value={this.state.dimension}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Description</label>
                          <Form.Control
                            placeholder="Enter Description"
                            type="text"
                            name="description"
                            value={this.state.description}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col className="pr-1" md="4">
                        <Form.Group>
                          <label>Qty</label>
                          <Form.Control
                            placeholder="Enter Qty"
                            type="number"
                            name="qty"
                            value={this.state.qty}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Ownership</label>
                          <Form.Control
                            placeholder="Enter Ownership"
                            type="text"
                            name="ownership"
                            value={this.state.ownership}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>

                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Remark</label>
                          <Form.Control
                            placeholder="Enter Remark"
                            type="text"
                            name="remark"
                            value={this.state.remark}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col className="pr-1" md="4">
                        <Form.Group>
                          <label>Amount</label>
                          <Form.Control
                            placeholder="Enter Amount"
                            type="number"
                            name="amount"
                            value={this.state.amount}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Date</label>
                          <Form.Control
                            placeholder="Enter Remark"
                            type="date"
                            name="date"
                            value={this.state.date}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="primary"
                      disabled={
                        this.state.item !== "" &&
                        this.state.dimension !== "" &&
                        this.state.description !== "" &&
                        this.state.qty !== "" &&
                        this.state.ownership !== "" &&
                        this.state.remark !== ""
                          ? false
                          : true
                      }
                      onClick={this.addProductInStock}
                    >
                      ADD
                    </Button>
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="danger"
                      style={{ marginLeft: "10px" }}
                      onClick={this.cancleAddProduct}
                    >
                      CLOSE
                    </Button>
                    <div className="clearfix"></div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          <Row>
            <Col md="12">
              <Card className="strpied-tabled-with-hover">
                <Card.Header>
                  <Card.Title as="h4">Current Stocks</Card.Title>
                </Card.Header>
                <Card.Body className="table-full-width table-responsive px-0">
                  <Table className="table-hover table-striped">
                    <thead>
                      <tr>
                        <th className="border-0">ID</th>
                        <th className="border-0">Item Name</th>
                        <th className="border-0">Dimension</th>
                        <th className="border-0">Description</th>
                        <th className="border-0">Qty.</th>
                        <th className="border-0">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.currentItems &&
                        this.state.currentItems.length > 0 &&
                        this.state.currentItems.map((item, i) => {
                          return (
                            <tr>
                              <td>{i + 1}</td>
                              <td>{item.item}</td>
                              <td>{item.dimension}</td>
                              <td>{item.description}</td>
                              <td>{item.qty}</td>
                              <td>{item.remark && item.remark}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default TableList;
