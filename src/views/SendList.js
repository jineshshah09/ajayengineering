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

class SendList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentStocks: [],
      vehicleNo: "",
      driverDL: "",
      toSite: "",
      date: new Date().toISOString().split('T')[0],
      addItem: [{ item: "", dimension: "", qty: "" }],
    };
  }

  componentDidMount = () => {
    this.getAllStockData();
  };

  getAllStockData = (id) => {
    axios
      .get(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/item?siteId=${this.props.activeSiteId}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            currentStocks: response.data,
          });
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleModalOpen = () => {
    const { addItem, vehicleNo, driverDL, toSite } = this.state;
    let lastIndex = addItem.length - 1;
    if (
      addItem[lastIndex].item !== "" &&
      addItem[lastIndex].dimension !== "" &&
      addItem[lastIndex].qty !== "" &&
      vehicleNo !== "" &&
      driverDL !== "" &&
      toSite !== ""
    ) {
      this.setState({
        openModal: true,
      });
    }
  };

  handleModalClose = () => {
    this.setState({
      openModal: false,
    });
  };

  handleChangeItemData = (e, id) => {
    let name = e.target.name;
    let value = e.target.value;
    let itemData = this.state.addItem;
    if (name == "item") itemData[id].item = value;
    else if (name == "dimension") itemData[id].dimension = value;
    else if (name == "qty") itemData[id].qty = value;
    this.setState({
      addItem: itemData,
    });
  };

  handleAddItemInTable = () => {
    const { addItem } = this.state;
    let lastIndex = addItem.length - 1;
    if (
      addItem[lastIndex].item !== "" &&
      addItem[lastIndex].dimension !== "" &&
      addItem[lastIndex].qty !== ""
    ) {
      let itemList = this.state.addItem;
      itemList.push({ item: "", dimension: "", qty: "" });
      this.setState({
        addItem: itemList,
      });
    }
  };

  removeLastItem = () => {
    if (this.state.addItem.length > 1) {
      let itemList = this.state.addItem;
      itemList.splice(-1, 1);
      this.setState({
        addItem: itemList,
      });
    }
  };

  saveSendOrder = () => {
    let items = this.state.addItem.map(data => {
      return(
        {"StockId": this.state.currentStocks[data.item].stockId[data.dimension], "qty" : data.qty}
      )
    })
    const data = {
      fromSiteId: this.props.activeSiteId,
      toSiteId: this.state.toSite,
      vehicleNo: this.state.vehicleNo,
      driverDL: this.state.driverDL,
      date: this.state.date,
      items: items
    };
    axios
      .post(`https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/send`, data,
      { headers: { 'Authorization': localStorage.getItem("token") }})
      .then((response) => {
        if (response.status == 200) {
          this.props.changeSite(this.state.toSite);
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  }

  render() {
    return (
      <>
        <Container fluid>
          <Row>
            <Col md="12">
              <Card>
                <Card.Header>
                  <Card.Title as="h4" style={{ color: "blue" }}>
                    <Row>
                      <Col className="pr-1" md="4">
                        From :
                        {
                          this.props.siteList[
                            this.props.siteList.findIndex(
                              (list) => list.id == this.props.activeSiteId
                            )
                          ].name
                        }{" "}
                        <Form.Group>
                          <label style={{ color: "blue" }}>To</label>
                          <Form.Control
                            as="select"
                            value={this.state.toSite}
                            name="toSite"
                            onChange={this.handleChange}
                            style={{ color: "blue" }}
                          >
                            <option value=""></option>
                            {this.props.siteList &&
                              this.props.siteList.map((site) => {
                                if (this.props.activeSiteId !== site.id) {
                                  return (
                                    <option value={site.id}>{site.name}</option>
                                  );
                                }
                              })}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
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
                            name="vehicleNo"
                            value={this.state.vehicleNo}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Driver Licence No.</label>
                          <Form.Control
                            type="text"
                            name="driverDL"
                            value={this.state.driverDL}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="4">
                        <Form.Group>
                          <label>Date</label>
                          <Form.Control
                            type="date"
                            name="date"
                            value={this.state.date}
                            onChange={this.handleChange}
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
                        <th className="border-0">Item Name</th>
                        <th className="border-0">Dimension</th>
                        <th className="border-0">Qty.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.addItem &&
                        this.state.addItem.map((item, index) => {
                          return (
                            <tr>
                              <td>
                                {" "}
                                <Form.Group>
                                  <Form.Control
                                    as="select"
                                    value={this.state.addItem[index].item}
                                    name="item"
                                    onChange={(e) =>
                                      this.handleChangeItemData(e, index)
                                    }
                                  >
                                    <option value=""></option>
                                    {this.state.currentStocks &&
                                      this.state.currentStocks.map(
                                        (stock, id) => {
                                          return (
                                            <option value={id}>
                                              {stock.item}
                                            </option>
                                          );
                                        }
                                      )}
                                  </Form.Control>
                                </Form.Group>
                              </td>
                              <td>
                                {" "}
                                <Form.Group>
                                  <Form.Control
                                    as="select"
                                    value={this.state.addItem[index].dimension}
                                    name="dimension"
                                    onChange={(e) =>
                                      this.handleChangeItemData(e, index)
                                    }
                                  >
                                    <option value=""></option>
                                    {this.state.currentStocks &&
                                      this.state.addItem[index].item !== "" &&
                                      this.state.currentStocks[
                                        this.state.addItem[index].item
                                      ].dimension.map((stock, id) => {
                                        return (
                                          <option value={id}>{stock}</option>
                                        );
                                      })}
                                  </Form.Control>
                                </Form.Group>
                              </td>
                              <td>
                                <Form.Group>
                                  <Form.Control
                                    placeholder="Enter Qty"
                                    type="text"
                                    name="qty"
                                    value={this.state.addItem[index].qty}
                                    onChange={(e) =>
                                      this.handleChangeItemData(e, index)
                                    }
                                  ></Form.Control>
                                </Form.Group>
                                (Available Qty :{" "}
                                {this.state.currentStocks &&
                                  this.state.addItem[index].dimension !== "" &&
                                  this.state.currentStocks[
                                    this.state.addItem[index].item
                                  ].qty[this.state.addItem[index].dimension]}
                                )
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                  <h6 className="pl-3 text-danger">
                    Note: Please fill all the fields to continue
                  </h6>
                  <br />
                  <div class="col-auto">
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="primary"
                      onClick={this.handleAddItemInTable}
                    >
                      Add Item
                    </Button>
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="success"
                      style={{ marginLeft: "15px" }}
                      onClick={this.handleModalOpen}
                    >
                      Send Stock
                    </Button>
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="danger"
                      style={{ marginLeft: "15px" }}
                      onClick={this.removeLastItem}
                    >
                      Remove Last Item
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
        <Modal
          show={this.state.openModal}
          onHide={this.handleModalClose}
          // backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Are you sure to send this much of material to{" "}
              {this.state.toSite !== "" &&
                this.props.siteList[
                  this.props.siteList.findIndex(
                    (site) => site.id == this.state.toSite
                  )
                ].name}{" "}
              ?
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="primary" type="submit" onClick={this.saveSendOrder}>
              Yes, I want to send
            </Button>
            <Button
              variant="danger"
              type="submit"
              onClick={this.handleModalClose}
            >
              No, I don't want to send
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default SendList;
