/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
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
import axios from "axios";

class Login extends Component {
  constructor(props) {
    super();
    this.state = {
      userName: "",
      password: "",
      error: false,
      errorMessage: ''
    };
  }

  login = () => {
    const loginData = {
      username: this.state.userName,
      password: this.state.password,
    };
    axios
      .post(`https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/user/login`, loginData)
      .then((response) => {
        if (response.status == 200) {
          localStorage.setItem("token",response.data.token);
          window.location.replace('/admin/dashboard');
          // this.props.history.push('/admin/dashboard');
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
        <div className="wrapper">
          <Row>
            <Col md="12">
              <Card>
                <Card.Body>
                    <Row>
                      <Col className="pr-1" md="6">
                        <Form.Group>
                          <label>Username</label>
                          <Form.Control
                            placeholder="Enter Item Name"
                            type="text"
                            name="userName"
                            value={this.state.userName}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                      <Col className="pl-1" md="6">
                        <Form.Group>
                          <label>Password</label>
                          <Form.Control
                            placeholder="Enter Dimension"
                            type="text"
                            name="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                          ></Form.Control>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      className="btn-fill pull-right"
                      type="submit"
                      variant="primary"
                      onClick={this.login}
                    >
                      Login
                    </Button>

                    <div className="clearfix"></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Login;
