import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { Nav, Button, Form, Modal, Row, Col } from "react-bootstrap";

import logo from "assets/img/reactlogo.png";
import ajayLogo from 'assets/img/ajaylogo.png';
import axios from "axios";
import { REACT_API_ENDPOINT } from '../../configUrl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Sidebar extends Component {
  constructor(props) {
    super();
    this.state = {
      addSite: false,
      siteName: "",
      inChargePerson: "",
      contactNo: "",
      address: "",
      openModal: false,
      password: '',
      deleteSitePopup: false,
      deleteSiteName: '',
      typeOfTransaction: ''
    };
  }

  componentDidMount = () => {};

  allowAddSite = () => {
    this.setState({
      addSite: true,
    });
  };

  cancleAddSite = () => {
    this.setState({
      addSite: false,
      siteName: "",
      inChargePerson: "",
      contactNo: "",
      address: "",
    });
  };

  onKeyDown = (event) => {
    if (event.key === 'Enter') {
      if(this.state.typeOfTransaction == "delete_site"){
        event.preventDefault();
        this.deleteExistingSite();
      }
      if(this.state.typeOfTransaction == "add_site"){
        event.preventDefault();
        this.addNewSite();
      }
    }
  }

  addNewSite = () => {
    const article = {
      name: this.state.siteName,
      inCharge: this.state.inChargePerson,
      contact: this.state.contactNo,
      address: this.state.address,
      password: this.state.password
    };
    axios
      .post(`${REACT_API_ENDPOINT}/api/site`, article,
      { headers: { 'Authorization': localStorage.getItem("token") }})
      .then((response) => {
        if (response.status == 200) {
          this.handleModalClose();
          this.cancleAddSite();
          this.props.getAllSites();
          toast.error("Site added successfully!!");
        }
      })
      .catch((error) => {
        if (error?.response?.status == 401) {
          localStorage.clear();
          window.location.replace("/admin/login");
        } else if (
          error?.response?.status == 403 &&
          error.response?.data?.message
        ) {
          toast.error(error.response.data.message);
        } else toast.error("Error while creating site");
        console.error("There was an error!", error);
      });
  };

  deleteExistingSite = () => {
    const data = {
      password: this.state.password,
    };
    axios
      .delete(`${REACT_API_ENDPOINT}/api/site/${this.state.deleteSiteName}`, {
        headers: { Authorization: localStorage.getItem("token") },
        data,
      })
      .then((response) => {
        if (response.status == 200) {
          this.handleModalClose();
          this.setState({ deleteSiteName: '', deleteSitePopup: false })
          this.props.getAllSites();
          toast.success("Site deleted successfully!!");
        }
      })
      .catch((error) => {
        if (error?.response?.status == 401) {
          localStorage.clear();
          window.location.replace("/admin/login");
        } else if (
          error?.response?.status == 403 &&
          error.response?.data?.message
        ) {
          toast.error(error.response.data.message);
        } else toast.error("Error while deleting site");
        console.error("There was an error!", error);
      });
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  checkActiveSite = (id) => {
    return id == this.props.activeSiteId;
  };

  handleModalOpen = (type) => {
    this.setState({
      openModal: true,
      addSite: false,
      deleteSitePopup: false,
      typeOfTransaction: type
    });
  };

  handleModalClose = () => {
    this.setState({
      openModal: false,
      password: '',
      typeOfTransaction: ''
    });
  };

  render() {
    return (
      <div
        className="sidebar"
        data-image={"/static/media/sidebar-4.b7eb4d1b.jpg"}
        data-color={"black"}
      >
        <div
          className="sidebar-background"
          style={{
            backgroundImage: "url(/static/media/sidebar-4.b7eb4d1b.jpg)",
          }}
        />
        <div className="sidebar-wrapper">
          <div className="logo d-flex align-items-center justify-content-start">
            {/* <p className="simple-text">Welcome User!!</p> */}
            <img src={ajayLogo} alt="Welcome User"/>
          </div>
          {/* <ul style={{ listStyleType: "none" }}>
            {this.props.routes.map((prop, key) => {
              if (!prop.redirect)
                return (
                  <li
                    className={
                      prop.upgrade
                        ? "active active-pro"
                        : this.activeRoute(prop.layout + prop.path)
                    }
                    key={key}
                  >
                    <p
                      className="nav-link"
                      activeClassName="active"
                      onClick={() => this.props.changeSite(prop.id)}
                    >
                      {prop.name}
                    </p>
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              return null;
            })}
          </ul> */}

          <ul
            style={{
              listStyleType: "none",
              paddingLeft: "15px",
              paddingRight: "15px",
              paddingTop: "10px",
            }}
          >
            {this.props.siteList &&
              this.props.siteList.length > 0 &&
              this.props.siteList.map((prop, key) => {
                if (!prop.redirect && !prop.isDeleted)
                  return (
                    <li
                      style={{
                        backgroundColor: this.checkActiveSite(prop.id)
                          ? "black"
                          : "transparent",
                        cursor: "pointer",
                      }}
                      key={key}
                    >
                      <p
                        className="nav-link"
                        activeClassName="active"
                        onClick={() => this.props.changeSite(prop.id)}
                      >
                        {prop.name}
                      </p>
                    </li>
                  );
              })}
            <li className="active active-pro">
              <Button
                type="submit"
                variant="secondary"
                style={{ color: "white" }}
                onClick={this.allowAddSite}
              >
                + ADD NEW SITE
              </Button>
            </li>
            {this.props.siteList &&
            this.props.siteList.length > 0 &&
              <li className="active active-pro">
                <Button
                  type="submit"
                  variant="secondary"
                  style={{ color: "white", marginTop: "15px" }}
                  onClick={() => {
                    this.setState({
                      deleteSitePopup: true,
                      deleteSiteName: ''
                    })
                  }}
                >
                  DELETE SITE
                </Button>
              </li>
            }
          </ul>
        </div>
        <Modal
          show={this.state.addSite}
          onHide={this.cancleAddSite}
          // backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Site</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Site Name: </Form.Label>
              <Form.Control
                type="text"
                required
                onChange={this.handleChange}
                name="siteName"
                value={this.state.siteName}
                placeholder="Enter Site Name"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>InCharge Person: </Form.Label>
              <Form.Control
                type="text"
                required
                onChange={this.handleChange}
                name="inChargePerson"
                value={this.state.inChargePerson}
                placeholder="Enter InCharge Person"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact Number: </Form.Label>
              <Form.Control
                type="text"
                required
                onChange={this.handleChange}
                name="contactNo"
                value={this.state.contactNo}
                placeholder="Enter Contact Number"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Address: </Form.Label>
              <Form.Control
                type="text"
                required
                onChange={this.handleChange}
                name="address"
                value={this.state.address}
                placeholder="Enter Address"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              disabled={
                this.state.siteName !== "" &&
                this.state.inChargePerson !== "" &&
                this.state.contactNo !== "" &&
                this.state.address !== ""
                  ? false
                  : true
              }
              type="submit"
              style={{ color: "blue" }}
              onClick={() => this.handleModalOpen("add_site")}
            >
              ADD
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.openModal}
          onHide={this.handleModalClose}
          // backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.typeOfTransaction == "delete_site" ? 
                "Are you sure to delete this site?"
              : this.state.typeOfTransaction == "add_site" && 
                "Are you sure to add this site?"
              }
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
            {this.state.typeOfTransaction == "delete_site" ? 
              <Button
                variant="primary"
                type="submit"
                onClick={this.deleteExistingSite}
                style={{  }}
              >
                Yes, I want to delete
              </Button>
            : this.state.typeOfTransaction == "add_site" && 
              <Button
                variant="primary"
                type="submit"
                onClick={this.addNewSite}
              >
               Yes, I want to add
              </Button>
            }
            <Button
              variant="danger"
              type="submit"
              onClick={this.handleModalClose}
            >
              {this.state.typeOfTransaction == "delete_site" ? 
                "No, I don't want to delete"
              : this.state.typeOfTransaction == "add_site" && 
                "No, I don't want to add"
              }
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.deleteSitePopup}
          onHide={() => { this.setState({ deleteSitePopup: false, deleteSiteName: '' }) }}
        >
          <Modal.Header closeButton>
            <Modal.Title>DELETE EXISTING SITE</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Please select site Name to delete: </Form.Label>
              <Form.Control
                as="select"
                value={this.state.deleteSiteName}
                name="item"
                onChange={(e) => {
                  this.setState({ deleteSiteName: e.target.value })
                }}
              >
                <option value=""></option>
                {this.props.siteList &&
                this.props.siteList.length > 0 &&
                  this.props.siteList.map(
                    (site) => {
                      return (
                        <option value={site.id}>
                          {site.name}
                        </option>
                      );
                    }
                  )}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              type="submit"
              style={{ color: "red" }}
              onClick={() => this.handleModalOpen("delete_site")}
              disabled={this.state.deleteSiteName !== "" ? false : true}
            >
              DELETE
            </Button>
            <Button
              variant="primary"
              type="submit"
              style={{ color: "blue" }}
              onClick={() => { this.setState({ deleteSitePopup: false, deleteSiteName: '' }) }}
            >
              CANCLE
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer />
      </div>
    );
  }
}

export default withRouter(Sidebar);
