import React, { Component, Fragment } from "react";
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
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { REACT_API_ENDPOINT } from "../configUrl";
import ReactExport from "react-export-excel";
import { Grid } from "@material-ui/core";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class TableList extends Component {
  constructor(props) {
    super();
    this.state = {
      currentItems: [],
      filteredCurrentItems: [],
      addNewItem: false,
      addTask: true,
      repeatItem: [
        {
          item: "",
          itemManual: "",
          dimension: "",
          dimensionManual: "",
          description: "",
          qty: "",
          remark: "",
          itemImage: null,
          date: new Date().toISOString().split("T")[0],
          ownership: "",
          itemImageType: "",
        },
      ],
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
      searchName: "",
      typeOfOrderPurchased: 0,
      itemManual: "",
      dimensionManual: "",
      detailsId: "",
      detailsName: "",
      detailsDimension: "",
      itemDetailsData: [],
      loading: false,
    };
  }

  componentDidMount = async () => {
    if (this.props.activeSiteId !== "") {
      this.getAllStockData(this.props.activeSiteId);
    }
  };

  uploadFiletoS3 = async (res) => {
    if (this.state.typeOfModal == "add_single") {
      if (res[0].imageUploadUrl) {
        const result = await fetch(res[0].imageUploadUrl, {
          method: "PUT",
          body: this.state.itemImage,
        });
      }
      if (res[0].fileUploadUrl) {
        const result = await fetch(res[0].fileUploadUrl, {
          method: "PUT",
          body: this.state.orderFile,
        });
      }
    }
    if (this.state.typeOfModal == "add_multiple") {
      for (var i = 0; i < res.length; i++) {
        if (res[i].imageUploadUrl) {
          const result = await fetch(res[i].imageUploadUrl, {
            method: "PUT",
            body: this.state.repeatItem[i].itemImage,
          });
        }
      }
    }
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.activeSiteId !== this.props.activeSiteId) {
      this.getAllStockData(nextProps.activeSiteId);
      this.getCurrentUniqueStockData(nextProps.activeSiteId);
    }
  };

  getAllStockData = (id) => {
    axios
      .get(`${REACT_API_ENDPOINT}/api/stock/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((response) => {
        if (response.status == 200) {
          if (response.data.length > 0) {
            response.data.sort((a, b) => a.item.localeCompare(b.item));
          }
          this.setState({
            currentItems: response.data,
            filteredCurrentItems: response.data,
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
      repeatItem: [
        {
          item: "",
          itemManual: "",
          dimension: "",
          dimensionManual: "",
          description: "",
          qty: "",
          remark: "",
          itemImage: null,
          date: new Date().toISOString().split("T")[0],
          ownership: "",
          itemImageType: "",
        },
      ],
      typeOfOrderPurchased: 0,
      itemManual: "",
      dimensionManual: ""
    });
  };

  deleteProductInStock = async (id) => {
    const data = {
      password: this.state.password,
    };
    axios
      .delete(`${REACT_API_ENDPOINT}/api/stock/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
        data,
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
    var data = this.state.filteredCurrentItems.filter(
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
    // this.setState({
    //   loading: true
    // });
    let data;
    if (this.state.typeOfModal == "add_single") {
      data = {
        isPurchaseOrder: true,
        password: this.state.password,
        items: [
          {
            item:
              this.state.item == "Others"
                ? this.state.itemManual
                : this.state.currentStocks[this.state.item].item,
            dimension:
              this.state.dimension == "Others"
                ? this.state.dimensionManual
                : this.state.currentStocks[this.state.item].dimension[this.state.dimension],
            description: this.state.description,
            qty: this.state.qty,
            ownership: this.state.ownership,
            remark: this.state.remark,
            date: this.state.date,
            amount: this.state.amount,
            SiteId: this.props.activeSiteId,
            isImage: this.state.itemImageType,
            isFile: this.state.orderFileType,
          },
        ],
      };
    }
    if (this.state.typeOfModal == "add_multiple") {
      let itemsData = [];
      for (var i = 0; i < this.state.repeatItem.length; i++) {
        let data = {
          item:
            this.state.repeatItem[i].item == "Others"
              ? this.state.repeatItem[i].itemManual
              : this.state.currentStocks[this.state.repeatItem[i].item].item,
          dimension:
            this.state.repeatItem[i].dimension == "Others"
              ? this.state.repeatItem[i].dimensionManual
              : this.state.currentStocks[this.state.repeatItem[i].item].dimension[this.state.repeatItem[i].dimension],
          description: this.state.repeatItem[i].description,
          qty: this.state.repeatItem[i].qty,
          ownership: this.state.repeatItem[i].ownership,
          remark: this.state.repeatItem[i].remark,
          date: this.state.repeatItem[i].date,
          amount: "",
          SiteId: this.props.activeSiteId,
          isImage: this.state.repeatItem[i].itemImageType,
          isFile: "",
        };
        itemsData.push(data);
      }
      data = {
        isPurchaseOrder: false,
        password: this.state.password,
        items: itemsData,
      };
    }
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
          this.getCurrentUniqueStockData(this.props.activeSiteId);
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

  handleChangeItemData = (e, id) => {
    let name = e.target.name;
    let value = e.target.value;
    let itemData = this.state.repeatItem;
    if (name == "item") itemData[id].item = value;
    else if (name == "dimension") itemData[id].dimension = value;
    else if (name == "qty") itemData[id].qty = value;
    else if (name == "remark") itemData[id].remark = value;
    else if (name == "description") itemData[id].description = value;
    else if (name == "itemManual") itemData[id].itemManual = value;
    else if (name == "dimensionManual") itemData[id].dimensionManual = value;
    else if (name == "date") itemData[id].date = value;
    else if (name == "ownership") itemData[id].ownership = value;
    this.setState({
      repeatItem: itemData,
    });
  };

  handleAttachChangeImageList = (e, id) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    let self = this;
    let itemData = this.state.repeatItem;
    reader.onload = function (event) {
      itemData[id].itemImageType = file.type.split("/")[1];
      itemData[id].itemImage = event.target.result;
      self.setState({
        repeatItem: itemData,
      });
    };
    reader.readAsArrayBuffer(file);
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
    } else if (this.state.typeOfOrderPurchased == "0") {
      this.setState({
        openModal: true,
        typeOfModal: "add_multiple",
      });
    } else {
      this.setState({
        openModal: true,
        typeOfModal: "add_single",
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
      loading: false,
    });
    this.cancleAddProduct();
  };

  sortListByName = (e) => {
    this.setState(
      {
        searchName: e.target.value,
      },
      () => {
        let data = this.state.currentItems;
        let filterdData = data.filter((item) =>
          item.item.toLowerCase().includes(e.target.value.toLowerCase())
        );
        this.setState({
          filteredCurrentItems: filterdData,
        });
      }
    );
  };

  addNewItemInList = () => {
    let itemList = this.state.repeatItem;
    itemList.push({
      item: "",
      itemManual: "",
      dimension: "",
      dimensionManual: "",
      description: "",
      qty: "",
      remark: "",
      itemImage: null,
      date: new Date().toISOString().split("T")[0],
      ownership: "",
      itemImageType: "",
    });
    this.setState({
      repeatItem: itemList,
    });
  };

  getCurrentUniqueStockData = (id) => {
    axios
      .get(`${REACT_API_ENDPOINT}/api/item?siteId=${id}`, {
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

  removeItemFromList = (id) => {
    let data = this.state.repeatItem;
    data.splice(id, 1);
    this.setState({
      repeatItem: data,
    });
  };

  openDetails = (id) => {
    let data = this.state.filteredCurrentItems.filter((item) => item.id == id);
    this.setState({
      detailsId: id,
      detailsName: data[0].item,
      detailsDimension: data[0].dimension,
    });
    axios
      .get(`${REACT_API_ENDPOINT}/api/transaction/${id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((response) => {
        if (response.status == 200) {
          this.setState({
            itemDetailsData: response.data,
          });
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
        console.error("There was an error!", error.response);
      });
  };

  onKeyDown = (event) => {
    if (event.key === 'Enter') {
      if(this.state.editSiteId &&
        this.state.editSiteId !== "" &&
        this.state.typeOfModal == "edit"){
          this.editProductInStock();
      }else if(this.state.deleteSiteId &&
        this.state.deleteSiteId !== "" &&
        this.state.typeOfModal == "delete"){
          this.deleteProductInStock(this.state.deleteSiteId)
      }else if(this.state.typeOfModal == "add_single" ||
        this.state.typeOfModal == "add_multiple"){
        this.addProductInStock();
      }
      event.preventDefault();
    }
  };

  render() {
    return (
      <>
        {this.state.loading && (
          <div>
            <Spinner
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                zIndex: 9999,
              }}
              animation="border"
              role="status"
            ></Spinner>
          </div>
        )}
        <Container fluid>
          <br />
          {this.props.activeSiteId !== "" && (
            <div style={{ marginBottom: "10px" }}>
              {this.state.detailsId == "" ? (
                <Fragment>
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
                </Fragment>
              ) : (
                this.state.detailsId !== "" && (
                  <Button
                    className="btn-fill pull-right"
                    type="submit"
                    variant="secondary"
                    onClick={() =>
                      this.setState({
                        detailsId: "",
                        detailsName: "",
                        detailsDimension: "",
                        itemDetailsData: [],
                      })
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Back to Current Stocks
                  </Button>
                )
              )}

              {this.state.filteredCurrentItems &&
                this.state.filteredCurrentItems.length > 0 && (
                  <ExcelFile
                    filename={this.state.detailsId == "" ?
                      this.props.siteList.filter(
                        (item) =>
                          parseInt(item.id) == parseInt(this.props.activeSiteId)
                      )[0].name + "_stocks"
                    : this.state.detailsId !== "" &&
                      "Transactions_of_" + this.state.detailsName + "[" + this.state.detailsDimension + "]"
                    }
                    element={
                      <Button
                        className="btn-fill pull-right"
                        type="submit"
                        variant="success"
                        style={{ marginRight: "10px", float: "right" }}
                      >
                        Download Stocks
                      </Button>
                    }
                  >
                    {this.state.detailsId == "" ? (
                      <ExcelSheet
                        data={this.state.filteredCurrentItems}
                        name={
                          this.props.siteList.filter(
                            (item) =>
                              parseInt(item.id) ==
                              parseInt(this.props.activeSiteId)
                          )[0].name
                        }
                      >
                        <ExcelColumn label="Item Name" value="item" />
                        <ExcelColumn label="Dimension" value="dimension" />
                        <ExcelColumn label="Description" value="description" />
                        <ExcelColumn label="Qty." value="qty" />
                        <ExcelColumn label="Remark" value="remark" />
                      </ExcelSheet>
                    ) : (
                      this.state.detailsId !== "" && (
                        <ExcelSheet
                          data={this.state.itemDetailsData}
                          name={this.state.detailsName}
                        >
                          <ExcelColumn label="Transaction Type" value="type" />
                          <ExcelColumn label="From/To Site" value="fromToSiteId" />
                          <ExcelColumn
                            label="Date"
                            value="date"
                          />
                          <ExcelColumn label="Qty." value="qty" />
                          <ExcelColumn label="Remark" value="remark" />
                        </ExcelSheet>
                      )
                    )}
                  </ExcelFile>
                )}
            </div>
          )}
          {this.state.addNewItem && (
            <Row>
              <Col md="12">
                <Card>
                  <Card.Body>
                    {this.state.editSiteId == "" && (
                      <Fragment>
                        <Row>
                          <Col className="pr-1" md="3">
                            <Form.Check
                              style={{ display: "-webkit-inline-box" }}
                              value={this.state.typeOfOrderPurchased}
                              type="checkbox"
                              id={`purchasedOrder`}
                              onChange={(e) => {
                                this.setState({
                                  typeOfOrderPurchased: "1",
                                });
                              }}
                              checked={
                                this.state.typeOfOrderPurchased == "1"
                                  ? true
                                  : false
                              }
                              disabled={
                                this.state.typeOfOrderPurchased == "1"
                                  ? true
                                  : false
                              }
                            />
                            Purchased Order
                          </Col>
                          <Col className="pr-1" md="3">
                            <Form.Check
                              style={{ display: "-webkit-inline-box" }}
                              value={this.state.typeOfOrderPurchased}
                              type="checkbox"
                              id={`Others`}
                              onChange={(e) => {
                                this.setState({
                                  typeOfOrderPurchased: "0",
                                });
                              }}
                              checked={
                                this.state.typeOfOrderPurchased == "0"
                                  ? true
                                  : false
                              }
                              disabled={
                                this.state.typeOfOrderPurchased == "0"
                                  ? true
                                  : false
                              }
                            />
                            Others
                          </Col>
                        </Row>
                        <hr />
                      </Fragment>
                    )}
                    {this.state.typeOfOrderPurchased == "1" ||
                    (this.state.editSiteId && this.state.editSiteId !== "") ? (
                      <Fragment>
                        <Row>
                          <Col className="pr-1" md="3">
                            <Form.Group>
                              <label>Item Name</label>
                              <Form.Control
                                as="select"
                                value={this.state.item}
                                name="item"
                                onChange={this.handleChange}
                                disabled={
                                  this.state.editSiteId &&
                                  this.state.editSiteId !== ""
                                    ? true
                                    : false
                                }
                              >
                                <option value=""></option>
                                {this.state.currentStocks &&
                                  this.state.currentStocks.map((stock, id) => {
                                    return (
                                      <option value={id}>{stock.item}</option>
                                    );
                                  })}
                                <option value="Others">Others</option>
                              </Form.Control>
                            </Form.Group>
                          </Col>
                          <Col className="pr-1" md="3">
                            <Form.Group>
                              <label>Item Name(Manual)</label>
                              <Form.Control
                                placeholder="Enter Item Name(Manual)"
                                type="text"
                                name="itemManual"
                                value={this.state.itemManual}
                                onChange={this.handleChange}
                                disabled={
                                  this.state.editSiteId &&
                                  this.state.editSiteId !== ""
                                    ? true
                                    : this.state.item !== "Others"
                                    ? true
                                    : false
                                }
                              ></Form.Control>
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="3">
                            <Form.Group>
                              <label>Dimension</label>
                              <Form.Control
                                as="select"
                                value={this.state.dimension}
                                name="dimension"
                                onChange={this.handleChange}
                                disabled={
                                  this.state.editSiteId &&
                                  this.state.editSiteId !== ""
                                    ? true
                                    : false
                                }
                              >
                                <option value=""></option>
                                {this.state.currentStocks &&
                                  this.state.item !== "" &&
                                  this.state.item !== "Others" &&
                                  this.state.currentStocks[
                                    this.state.item
                                  ].dimension.map((stock, id) => {
                                    return <option value={id}>{stock}</option>;
                                  })}
                                <option value="Others">Others</option>
                              </Form.Control>
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="3">
                            <Form.Group>
                              <label>Dimension(Manual)</label>
                              <Form.Control
                                placeholder="Enter Dimension(Manual)"
                                type="text"
                                name="dimensionManual"
                                value={this.state.dimensionManual}
                                onChange={this.handleChange}
                                disabled={
                                  this.state.editSiteId &&
                                  this.state.editSiteId !== ""
                                    ? true
                                    : this.state.dimension !== "Others"
                                    ? true
                                    : false
                                }
                              ></Form.Control>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col className="pr-1" md="3">
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
                          <Col className="pr-1" md="3">
                            <Form.Group>
                              <label>Qty</label>
                              <Form.Control
                                placeholder="Enter Qty"
                                type="number"
                                name="qty"
                                value={this.state.qty}
                                onChange={this.handleChange}
                                disabled={
                                  this.state.editSiteId &&
                                  this.state.editSiteId !== ""
                                    ? true
                                    : false
                                }
                              ></Form.Control>
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="3">
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

                          <Col className="pl-1" md="3">
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
                        <hr />
                      </Fragment>
                    ) : (
                      <Fragment>
                        {this.state.repeatItem &&
                          this.state.repeatItem.map((item, index) => {
                            return (
                              <Fragment>
                                <Row>
                                  <Col className="pr-1" md="3">
                                    <Form.Group>
                                      <label>Item Name</label>
                                      <Form.Control
                                        as="select"
                                        value={
                                          this.state.repeatItem[index].item
                                        }
                                        name="item"
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                        disabled={
                                          this.state.editSiteId &&
                                          this.state.editSiteId !== ""
                                            ? true
                                            : false
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
                                        <option value="Others">Others</option>
                                      </Form.Control>
                                    </Form.Group>
                                  </Col>
                                  <Col className="pr-1" md="3">
                                    <Form.Group>
                                      <label>Item Name(Manual)</label>
                                      <Form.Control
                                        placeholder="Enter Item Name(Manual)"
                                        type="text"
                                        name="itemManual"
                                        value={
                                          this.state.repeatItem[index]
                                            .itemManual
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                        disabled={
                                          this.state.editSiteId &&
                                          this.state.editSiteId !== ""
                                            ? true
                                            : this.state.repeatItem[index]
                                                .item !== "Others"
                                            ? true
                                            : false
                                        }
                                      ></Form.Control>
                                    </Form.Group>
                                  </Col>
                                  <Col className="pl-1" md="3">
                                    <Form.Group>
                                      <label>Dimension</label>
                                      <Form.Control
                                        as="select"
                                        value={
                                          this.state.repeatItem[index].dimension
                                        }
                                        name="dimension"
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                        disabled={
                                          this.state.editSiteId &&
                                          this.state.editSiteId !== ""
                                            ? true
                                            : false
                                        }
                                      >
                                        <option value=""></option>
                                        {this.state.currentStocks &&
                                          this.state.repeatItem[index].item !==
                                            "" &&
                                          this.state.repeatItem[index].item !==
                                            "Others" &&
                                          this.state.currentStocks[
                                            this.state.repeatItem[index].item
                                          ].dimension.map((stock, id) => {
                                            return (
                                              <option value={id}>
                                                {stock}
                                              </option>
                                            );
                                          })}
                                        <option value="Others">Others</option>
                                      </Form.Control>
                                    </Form.Group>
                                  </Col>
                                  <Col className="pl-1" md="3">
                                    <Form.Group>
                                      <label>Dimension(Manual)</label>
                                      <Form.Control
                                        placeholder="Enter Dimension(Manual)"
                                        type="text"
                                        name="dimensionManual"
                                        value={
                                          this.state.repeatItem[index]
                                            .dimensionManual
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                        disabled={
                                          this.state.editSiteId &&
                                          this.state.editSiteId !== ""
                                            ? true
                                            : this.state.repeatItem[index]
                                                .dimension !== "Others"
                                            ? true
                                            : false
                                        }
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
                                        value={this.state.repeatItem[index].qty}
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                        disabled={
                                          this.state.editSiteId &&
                                          this.state.editSiteId !== ""
                                            ? true
                                            : false
                                        }
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
                                        value={
                                          this.state.repeatItem[index]
                                            .description
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
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
                                        value={
                                          this.state.repeatItem[index].remark
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                      ></Form.Control>
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col className="pr-1" md="4">
                                    <Form.Group>
                                      <label>Ownership</label>
                                      <Form.Control
                                        placeholder="Enter Ownership"
                                        type="text"
                                        name="ownership"
                                        value={
                                          this.state.repeatItem[index].ownership
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
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
                                        value={
                                          this.state.repeatItem[index].date
                                        }
                                        onChange={(e) =>
                                          this.handleChangeItemData(e, index)
                                        }
                                      ></Form.Control>
                                    </Form.Group>
                                  </Col>
                                  <Col className="pr-1" md="4">
                                    <Form.Group>
                                      <label>Item Image</label>
                                      <Form.Control
                                        placeholder="Upload Item Image"
                                        type="file"
                                        name="itemImage"
                                        onChange={(e) =>
                                          this.handleAttachChangeImageList(
                                            e,
                                            index
                                          )
                                        }
                                      ></Form.Control>
                                    </Form.Group>
                                  </Col>
                                </Row>
                                {index > 0 && (
                                  <Row
                                    style={{
                                      textAlign: "right",
                                      display: "block",
                                    }}
                                  >
                                    <Button
                                      className="btn-fill pull-right"
                                      type="submit"
                                      variant="danger"
                                      style={{ marginRight: "10px" }}
                                      onClick={() =>
                                        this.removeItemFromList(index)
                                      }
                                    >
                                      Remove Item
                                    </Button>
                                  </Row>
                                )}
                                <hr />
                              </Fragment>
                            );
                          })}
                      </Fragment>
                    )}
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="primary"
                      onClick={this.handleModalOpen}
                    >
                      {this.state.editSiteId && this.state.editSiteId !== ""
                        ? "Edit"
                        : "Save Data"}
                    </Button>

                    {this.state.editSiteId == "" &&
                      this.state.typeOfOrderPurchased == "0" && (
                        <Button
                          className="btn-fill pull-right"
                          type="submit"
                          variant="secondary"
                          style={{ marginLeft: "10px" }}
                          onClick={this.addNewItemInList}
                          disabled={
                            this.state.repeatItem[
                              this.state.repeatItem.length - 1
                            ].item !== "" &&
                            this.state.repeatItem[
                              this.state.repeatItem.length - 1
                            ].qty !== "" &&
                            this.state.repeatItem[
                              this.state.repeatItem.length - 1
                            ].description !== "" &&
                            this.state.repeatItem[
                              this.state.repeatItem.length - 1
                            ].dimension !== ""
                              ? false
                              : true
                          }
                        >
                          Add New Item
                        </Button>
                      )}

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
          {this.state.detailsId == "" ? (
            <Row>
              <Col md="12">
                <Card className="strpied-tabled-with-hover">
                  <Card.Header>
                    <Card.Title>
                      <Row>
                        <Col className="pr-1" md="7">
                          <h4 style={{ marginTop: "0px" }}>Current Stocks</h4>
                        </Col>
                        <Col className="pr-1" md="4">
                          <Form.Control
                            placeholder="Enter Search Text"
                            type="text"
                            name="amount"
                            value={this.state.searchName}
                            onChange={this.sortListByName}
                          ></Form.Control>
                        </Col>
                        <Col className="pr-1" md="1">
                          <Button
                            variant="primary"
                            size="sm"
                            style={{ marginTop: "5px" }}
                            onClick={() => {
                              this.setState({
                                searchName: "",
                                filteredCurrentItems: this.state.currentItems,
                              });
                            }}
                          >
                            Clear
                          </Button>
                        </Col>
                      </Row>
                    </Card.Title>
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
                        {this.state.filteredCurrentItems &&
                          this.state.filteredCurrentItems.length > 0 &&
                          this.state.filteredCurrentItems.map((item, i) => {
                            return (
                              <tr>
                                <td>{i + 1}</td>
                                <td>
                                  <p
                                    style={{ cursor: "pointer" }}
                                    onClick={() => this.openDetails(item.id)}
                                  >
                                    {item.item}
                                  </p>
                                </td>
                                <td>{item.dimension}</td>
                                <td>{item.description}</td>
                                <td>{item.qty}</td>
                                <td>{item.remark && item.remark}</td>
                                <td>
                                  {item.imageUploadUrl ? (
                                    <a
                                      href={`https://ajayeng-assets-prd.s3.ap-south-1.amazonaws.com/${item.imageUploadUrl}`}
                                      target="_blank"
                                    >
                                      View Image
                                    </a>
                                  ) : (
                                    <>-</>
                                  )}
                                </td>
                                <td>
                                  {/* <EditIcon
                                    onClick={() => this.editItem(item.id)}
                                    style={{
                                      cursor: "pointer",
                                      marginLeft: "13px",
                                    }}
                                  /> */}
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
          ) : (
            this.state.detailsId !== "" && (
              <Row>
                <Col md="12">
                  <Card className="strpied-tabled-with-hover">
                    <Card.Header>
                      <Card.Title>
                        <Row>
                          <Col className="pr-1" md="7">
                            <h4 style={{ marginTop: "0px" }}>
                              Transactions of {this.state.detailsName} [{" "}
                              {this.state.detailsDimension} ]
                            </h4>
                          </Col>
                        </Row>
                      </Card.Title>
                    </Card.Header>
                    <Card.Body className="table-full-width table-responsive px-0">
                      <Table className="table-hover table-striped">
                        <thead>
                          <tr>
                            <th className="border-0">Serial No.</th>
                            <th className="border-0">Transaction Type</th>
                            <th className="border-0">From/To Site</th>
                            <th className="border-0">Qty.</th>
                            <th className="border-0">Date</th>
                            <th className="border-0">Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.itemDetailsData &&
                            this.state.itemDetailsData.length > 0 &&
                            this.state.itemDetailsData.map((item, i) => {
                              return (
                                <tr>
                                  <td>{i + 1}</td>
                                  <td>{item.type ? item.type : "-"}</td>
                                  <td>
                                    {item.fromToSiteId
                                      ? this.props.siteList.filter(
                                          (itemDetails) =>
                                            parseInt(item.fromToSiteId) ==
                                            parseInt(itemDetails.id)
                                        )[0].name
                                      : "-"}
                                  </td>
                                  <td
                                    style={
                                      item.type &&
                                      item.type == "Sent"
                                        ? { color: "red" }
                                        : {
                                            color: "green",
                                          }
                                    }
                                  >
                                    {item.type &&
                                    item.type == "Sent"
                                      ? `-${item.qty}`
                                      : item.qty
                                    }
                                  </td>
                                  <td>{item.date ? item.date : "-"}</td>
                                  <td>
                                    {item.type && item.type == "Add"
                                      ? item.remark
                                      : item.type && item.type !== "Add"
                                      ? `CHALLAN NO : ${item.remark}`
                                      : "-"}
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
            )
          )}
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
                      onKeyDown={this.onKeyDown}
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
              (this.state.typeOfModal == "add_single" ||
                this.state.typeOfModal == "add_multiple") && (
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
