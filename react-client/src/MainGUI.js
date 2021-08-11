import React from "react";
import PinController from "./PinController";
import Container from "@material-ui/core/Container";
import { Jumbotron, Row } from "react-bootstrap"
import Grid from '@material-ui/core/Grid';

export default function MainGUI({ wsocket }) {

  let pins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return (

    <Jumbotron style={{ overflow: "auto" }}>
        <Container>

        <Row>
    <Grid container spacing={6}>
        {pins.map(pin => (
          <Grid item key={pin} xs={12} sm={6} md={4}>
          <PinController wsocket={wsocket} pin={pin} />
          </Grid>
        ))}
      </Grid>
      </Row>
        </Container>
      </Jumbotron>
  );
}
