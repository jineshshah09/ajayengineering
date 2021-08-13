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

class PurchaseOrderList extends Component {
  constructor(props) {
    super();
    this.state = {
      purchaseOrder: [],
    };
  }

  componentDidMount = () => {
    this.getPurchaseOrderData(this.props.activeSiteId);
  };

  getPurchaseOrderData = (id) => {
    axios
      .get(
        `https://4q931ru18g.execute-api.ap-south-1.amazonaws.com/test/api/purchaseOrder/${id}`,
        { headers: { Authorization: localStorage.getItem("token") } }
      )
      .then((response) => {
        if (response.status == 200) {
          console.log("testtt", response);
          this.setState({
            purchaseOrder: response.data,
          });
        } else if (response.status == 403) {
          localStorage.clear();
        }
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
        console.error("There was an error!", error);
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
                onClick={this.props.changeTableOrder}
              >
                Back to Current Stock
              </Button>
            </div>
          )}
          <Row>
            <Col md="12">
              <Card className="strpied-tabled-with-hover">
                <Card.Header>
                  <Card.Title as="h4">Purchase Orders</Card.Title>
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
                        <th className="border-0">Amount</th>
                        <th className="border-0">Remark</th>
                        <th className="border-0">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.purchaseOrder &&
                        this.state.purchaseOrder.length > 0 &&
                        this.state.purchaseOrder.map((item, i) => {
                          return (
                            <tr>
                              <td>{i + 1}</td>
                              <td>{item.item}</td>
                              <td>{item.dimension}</td>
                              <td>{item.description}</td>
                              <td>{item.qty}</td>
                              <td>{item.amount}</td>
                              <td>{item.remark}</td>
                              <td>{item.date}</td>
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

export default PurchaseOrderList;
