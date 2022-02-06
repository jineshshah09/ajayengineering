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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { REACT_API_ENDPOINT } from "../configUrl";

class SendList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentStocks: [],
      vehicleNo: "",
      challanNo: "",
      toSite: "",
      challanType: "",
      challanFile: null,
      date: new Date().toISOString().split("T")[0],
      addItem: [{ item: "", dimension: "", qty: "" }],
      password: "",
    };
  }

  componentDidMount = () => {
    this.getAllStockData();
  };

  getAllStockData = (id) => {
    axios
      .get(`${REACT_API_ENDPOINT}/api/item?siteId=${this.props.activeSiteId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            currentStocks: response.data,
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

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleModalOpen = () => {
    const { addItem, vehicleNo, challanNo, toSite } = this.state;
    let lastIndex = addItem.length - 1;
    if (
      addItem[lastIndex].item !== "" &&
      addItem[lastIndex].dimension !== "" &&
      addItem[lastIndex].qty !== "" &&
      vehicleNo !== "" &&
      challanNo !== "" &&
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
      password: ''
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

  saveSendOrder = async () => {
    let items = this.state.addItem.map((data) => {
      return {
        StockId: this.state.currentStocks[data.item].stockId[data.dimension],
        qty: data.qty,
      };
    });
    const data = {
      fromSiteId: this.props.activeSiteId,
      toSiteId: this.state.toSite,
      vehicleNo: this.state.vehicleNo,
      challanNo: this.state.challanNo,
      challanType: this.state.challanType,
      date: this.state.date,
      items: items,
      password: this.state.password,
    };
    axios
      .post(
        // `${REACT_API_ENDPOINT}/api/send`,
        `${REACT_API_ENDPOINT}/api/send`,
        data,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then(async (response) => {
        if (response.status == 200) {
          await this.uploadFiletoS3(response.data);
          toast.success("Send order saved successfully!!");
          this.props.changeTableOrder();
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
        } else toast.error("Error while saving send order");
        console.error("There was an error!", error);
      });
  };

  handleAttachChallan = (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    let self = this;
    reader.onload = function (event) {
      console.log(event.target.result);
      self.setState({
        challanFile: event.target.result,
        challanType: file.type.split("/")[1],
      });
    };
    reader.readAsArrayBuffer(file);
  };

  uploadFiletoS3 = async (res) => {
    if (res.challanUploadUrl) {
      const result = await fetch(res.challanUploadUrl, {
        method: "PUT",
        body: this.state.challanFile,
      });
    }
  };

  onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveSendOrder();
    }
  }

  render() {
    return (
      <>
        <Container fluid>
          <br />
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
                                if (this.props.activeSiteId !== site.id && !site.isDeleted) {
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
                      <Col className="pr-1" md="3">
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
                      <Col className="pl-1" md="3">
                        <Form.Group>
                          <label>Challan No.</label>
                          <Form.Control
                            type="text"
                            name="challanNo"
                            value={this.state.challanNo}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="3">
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
                      <Col className="pl-1" md="3">
                        <Form.Group>
                          <label>Challan</label>
                          <Form.Control
                            placeholder="Upload Challan"
                            type="file"
                            name="challanFile"
                            onChange={this.handleAttachChallan}
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
              onClick={this.saveSendOrder}
            >
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
        <ToastContainer />
      </>
    );
  }
}

export default SendList;
