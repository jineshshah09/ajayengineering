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
import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import Login from "layouts/Login.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const checkValidToken = () => {
  const token = localStorage.getItem('token');
  console.log("token",token)
  if(token && token !== undefined && token !== null && token !== '') return true
  else return false
  // Validation logic...
}

ReactDOM.render(
  <BrowserRouter>
    <Switch>
    <Route exact path="/admin/login" render={(props) => <Login {...props} />}/>
      {checkValidToken()
        ? <Route exact path="/admin/dashboard" render={(props) => <AdminLayout {...props} />}/>
        : <Redirect to="/admin/login"/>
      }
      <Route render={() => <Login {...props} />}/>
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
