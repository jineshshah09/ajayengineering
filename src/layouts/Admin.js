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
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
import ReceiveList from "views/ReceiveList";
import TableList from "views/TableList";
import SendList from "views/SendList";
import axios from "axios";

class Admin extends Component {
  constructor(props) {
    super();
    this.state = {
      siteList: [],
      activeSiteId: "",
      errorMessage: "",
      showDashboard: true,
      showSendOrder: false,
      showReceiveOrder: false,
    };
  }

  componentDidMount = () => {
    this.getAllSites();
  };

  getAllSites = () => {
    axios
      .get(`https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/site`, 
      { headers: { 'Authorization': localStorage.getItem("token") }})
      .then((response) => {
        if (response.status == 200) {
          console.log("testtt", response);
          this.setState({
            siteList: response.data,
          });
          // if (activeSiteId == "" && response.data.length > 0) {
          //   this.setState({
          //     activeSiteId: response.data[0].id,
          //   });
          // }
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("There was an error!", error);
      });
  };

  changeSite = (id) => {
    this.setState({
      activeSiteId: id 
    }, (() => {
        this.setState({
          showReceiveOrder: false,
          showDashboard: true,
          showSendOrder: false,
        });
      })
    )
  };
  changeReceiveOrder = () => {
    this.setState({
      showReceiveOrder: true,
      showDashboard: false,
      showSendOrder: false,
    });
  };
  changeSendOrder = () => {
    this.setState({
      showReceiveOrder: false,
      showDashboard: false,
      showSendOrder: true,
    });
  };
  render() {
    return (
      <>
        <div className="wrapper">
          <Sidebar
            siteList={this.state.siteList}
            changeSite={this.changeSite}
            getAllSites={this.getAllSites}
            activeSiteId={this.state.activeSiteId}
          />
          <div className="main-panel">
            <AdminNavbar />
            {this.state.showDashboard &&
              !this.state.showReceiveOrder &&
              !this.state.showSendOrder && (
                <TableList
                  activeSiteId={this.state.activeSiteId}
                  changeReceiveOrder={this.changeReceiveOrder}
                  changeSendOrder={this.changeSendOrder}
                />
              )}
            {this.state.showReceiveOrder &&
              !this.state.showDashboard &&
              !this.state.showSendOrder && (
                <ReceiveList activeSiteId={this.state.activeSiteId} siteList={this.state.siteList}/>
              )}
            {this.state.showSendOrder &&
              !this.state.showDashboard &&
              !this.state.showReceiveOrder && (
                <SendList activeSiteId={this.state.activeSiteId} siteList={this.state.siteList} changeSite={this.changeSite}/>
              )}
            {/* <div className="content">
              <Switch>{this.getRoutes(routes)}</Switch>
            </div> */}
            <Footer />
          </div>
        </div>
      </>
    );
  }
}

export default Admin;
