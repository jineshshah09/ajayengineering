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
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { REACT_API_ENDPOINT } from "../configUrl";

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
      editSiteId: "",
      deleteSiteId: "",
      itemImageType: "",
      orderFileType: "",
      itemImage: null,
      orderFile: null,
      typeOfModal: "",
      openModal: false,
      password: "",
    };
  }

  componentDidMount = async () => {
    if (this.props.activeSiteId !== "") {
      this.getAllStockData(this.props.activeSiteId);
    }
  };

  uploadFiletoS3 = async (res) => {
    if (res.imageUploadUrl) {
      const result = await fetch(res.imageUploadUrl, {
        method: "PUT",
        body: this.state.itemImage,
      });
    }
    if (res.fileUploadUrl) {
      const result = await fetch(res.fileUploadUrl, {
        method: "PUT",
        body: this.state.orderFile,
      });
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.activeSiteId !== this.props.activeSiteId) {
      this.getAllStockData(nextProps.activeSiteId);
    }
  };

  getAllStockData = (id) => {
    axios
      .get(`${REACT_API_ENDPOINT}/api/stock/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((response) => {
        if (response.status == 200) {
          if(response.data.length > 0){
            response.data.sort((a, b) => a.item.localeCompare(b.item));
          }
          this.setState({
            currentItems: response.data,
          });
          if (activeSiteId == "" && response.data.length > 0) {
            this.setState({
              activeSiteId: response.data[0].id,
            });
          }
        }
      })
      .catch((error) => {
        // if (error.response.status == 401) {
        //   localStorage.clear();
        //   window.location.replace("/admin/login");
        // } else if (
        //   error.response.status == 403 &&
        //   error.response?.data?.message
        // ) {
        //   toast.error(error.response.data.message);
        // } else toast.error("Error while fetching stock");
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
      editSiteId: "",
      itemImageType: "",
      orderFileType: "",
      itemImage: null,
      orderFile: null,
    });
  };

  deleteProductInStock = async (id) => {
    const data = {
      password: this.state.password,
    };
    axios
      .delete(`${REACT_API_ENDPOINT}/api/stock/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }, data
      })
      .then(async (response) => {
        if (response.status == 200) {
          toast.success("Item deleted successfully!!");
          this.handleModalClose();
          this.getAllStockData(this.props.activeSiteId);
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
        } else toast.error("Error while deleting item");
        console.error("There was an error!", error);
      });
  };

  editItem = (id) => {
    var data = this.state.currentItems.filter(
      (item) => parseInt(item.id) == parseInt(id)
    );

    this.setState({
      editSiteId: id,
      item: data[0].item,
      dimension: data[0].dimension,
      description: data[0].description,
      qty: data[0].qty,
      ownership: data[0].ownership,
      remark: data[0].remark,
      date: data[0].date,
      amount: data[0].amount,
    });
    this.allowAddProduct();
  };

  editProductInStock = async () => {
    const data = {
      item: this.state.item,
      dimension: this.state.dimension,
      description: this.state.description,
      qty: this.state.qty,
      ownership: this.state.ownership,
      remark: this.state.remark,
      date: this.state.date,
      amount: this.state.amount,
      isImage: this.state.itemImageType,
      isFile: this.state.orderFileType,
      password: this.state.password,
    };
    axios
      .put(`${REACT_API_ENDPOINT}/api/stock/${this.state.editSiteId}`, data, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then(async (response) => {
        if (response.status == 200) {
          await this.uploadFiletoS3(response.data);
          toast.success("Item edited successfully!!");
          this.handleModalClose();
          this.getAllStockData(this.props.activeSiteId);
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
        } else toast.error("Error while editing item");
        console.error("There was an error!", error);
      });
  };

  addProductInStock = async () => {
    console.log("this.state.itemImage", this.state.itemImage);
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
      isImage: this.state.itemImageType,
      isFile: this.state.orderFileType,
      password: this.state.password,
    };
    axios
      .post(`${REACT_API_ENDPOINT}/api/stock`, data, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then(async (response) => {
        if (response.status == 200) {
          await this.uploadFiletoS3(response.data);
          this.handleModalClose();
          toast.success("Item added successfully!!");
          this.getAllStockData(this.props.activeSiteId);
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
        } else toast.error("Error while adding item");
        console.error("There was an error!", error);
      });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleAttachChangeImage = (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    let self = this;
    reader.onload = function (event) {
      console.log(event.target.result);
      self.setState({
        itemImageType: file.type.split("/")[1],
        itemImage: event.target.result,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  handleAttachChangeFile = (e) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    let self = this;
    reader.onload = function (event) {
      console.log(event.target.result);
      self.setState({
        orderFileType: file.type.split("/")[1],
        orderFile: event.target.result,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  handleModalOpen = (type, id) => {
    if (this.state.editSiteId !== "") {
      this.setState({
        openModal: true,
        typeOfModal: "edit",
      });
    } else if (type == "delete") {
      this.setState({
        deleteSiteId: id,
        openModal: true,
        typeOfModal: type,
      });
    } else {
      this.setState({
        openModal: true,
        typeOfModal: "add",
      });
    }
  };

  handleModalClose = () => {
    this.setState({
      openModal: false,
      deleteSiteId: "",
      typeOfModal: "",
      openModal: false,
      password: "",
    });
    this.cancleAddProduct();
  };

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
                      <Col className="pr-1" md="3">
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
                      <Col className="pl-1" md="3">
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
                      <Col className="pr-1" md="3">
                        <Form.Group>
                          <label>Item Image</label>
                          <Form.Control
                            placeholder="Upload Item Image"
                            type="file"
                            name="itemImage"
                            onChange={this.handleAttachChangeImage}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pr-1" md="3">
                        <Form.Group>
                          <label>PurchaseOrder File (pdf)</label>
                          <Form.Control
                            placeholder="Upload File"
                            type="file"
                            name="orderFile"
                            onChange={this.handleAttachChangeFile}
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
                        this.state.remark !== ""
                          ? false
                          : true
                      }
                      onClick={this.handleModalOpen}
                    >
                      {this.state.editSiteId && this.state.editSiteId !== ""
                        ? "Edit"
                        : "Add"}
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
                        <th className="border-0">Item Image</th>
                        <th className="border-0">Actions</th>
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
                              <td>
                                {item.imageUploadUrl ? (
                                  <a
                                    href={`https://ajayeng-assets.s3.ap-south-1.amazonaws.com/${item.imageUploadUrl}`}
                                    target="_blank"
                                  >
                                    View Image
                                  </a>
                                ) : (
                                  <>-</>
                                )}
                              </td>
                              <td>
                                <EditIcon
                                  onClick={() => this.editItem(item.id)}
                                  style={{
                                    cursor: "pointer",
                                    marginLeft: "13px",
                                  }}
                                />
                                <DeleteIcon
                                  onClick={() =>
                                    this.handleModalOpen("delete", item.id)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    marginLeft: "13px",
                                  }}
                                />
                              </td>
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
        <Modal
          show={this.state.openModal}
          onHide={this.handleModalClose}
          // backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Are you sure ? If yes, Enter password.
              <Row className="pt-3">
                <Col className="pr-1" md="12">
                  <Form.Group>
                    <Form.Control
                      placeholder="Enter Password"
                      type="password"
                      name="password"
                      value={this.state.password}
                      onChange={this.handleChange}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            {this.state.editSiteId &&
            this.state.editSiteId !== "" &&
            this.state.typeOfModal == "edit" ? (
              <Button
                variant="primary"
                type="submit"
                onClick={this.editProductInStock}
              >
                Yes, I want to edit
              </Button>
            ) : this.state.deleteSiteId &&
              this.state.deleteSiteId !== "" &&
              this.state.typeOfModal == "delete" ? (
              <Button
                variant="primary"
                type="submit"
                onClick={() =>
                  this.deleteProductInStock(this.state.deleteSiteId)
                }
              >
                Yes, I want to delete
              </Button>
            ) : (
              this.state.typeOfModal == "add" && (
                <Button
                  variant="primary"
                  type="submit"
                  onClick={this.addProductInStock}
                >
                  Yes, I want to add
                </Button>
              )
            )}
            <Button
              variant="danger"
              type="submit"
              onClick={this.handleModalClose}
            >
              No, I don't want to
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer />
      </>
    );
  }
}

export default TableList;
