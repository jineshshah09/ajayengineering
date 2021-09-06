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
import Background from "../../src/assets/img/sidebar-4.jpg";
import ajayLogo from 'assets/img/ajaylogo.png';
import { REACT_API_ENDPOINT } from '../configUrl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class Login extends Component {
  constructor(props) {
    super();
    this.state = {
      userName: "",
      password: "",
      error: false,
      errorMessage: "",
    };
  }

  login = () => {
    const loginData = {
      username: this.state.userName,
      password: this.state.password,
    };
    axios
      .post(
        `${REACT_API_ENDPOINT}/user/login`,
        loginData
      )
      .then((response) => {
        if (response.status == 200) {
          toast.success(response.data.message);
          console.log("Login successfully!!")
          localStorage.setItem("token", response.data.token);
          window.location.replace("/admin/dashboard");
          // this.props.history.push('/admin/dashboard');
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        // this.setState({ errorMessage: error.message });
        localStorage.clear();
      });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    return (
      <div style={{ backgroundColor: "aliceblue" }}>
        <div className="wrapper loginform">
          <Row>
            <Col md="12">
              <Card>
                <Card.Body>
                <div className="logo-login">
            {/* <p className="simple-text">Welcome User!!</p> */}
            <img src={ajayLogo} alt="Welcome User"/>
          </div>
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label style={{ color: "black" }}>Username</label>
                        <Form.Control
                          placeholder="Enter User Name"
                          type="text"
                          name="userName"
                          value={this.state.userName}
                          onChange={this.handleChange}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="12">
                      <Form.Group>
                        <label style={{ color: "black" }}>Password</label>
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
                  {this.state.errorMessage && this.state.errorMessage !== "" &&
                  <p style={{ textAlign : "center" }} className="text-danger">Invalid Username or Password</p>
                  }
                  <div style={{ textAlign : "center" }}>
                  <Button
                    className="login-button"
                    type="submit"
                    variant="primary"
                    onClick={this.login}
                  >
                    Login
                  </Button>
                  </div>
                  

                  <div className="clearfix"></div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default Login;
