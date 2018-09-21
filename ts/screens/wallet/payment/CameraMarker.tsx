import { Col, Grid, Row, View } from "native-base";
import * as React from "react";

import { StyleSheet } from "react-native";

import variables from "../../../theme/variables";

type MarkerState = "SCANNING" | "VALID" | "INVALID";

type Props = {
  width: number;
  state: MarkerState;
};

export const CameraMarker: React.SFC<Props> = ({ width, state }) => {
  const styles = StyleSheet.create({
    rectangleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent"
    },

    rectangle: {
      height: width / 2,
      width: width / 2,
      borderWidth: 0,
      backgroundColor: "transparent"
    },

    smallBorded: {
      height: width / 6,
      width: width / 6,
      borderColor: variables.brandPrimaryInverted,
      backgroundColor: "transparent",
      position: "absolute"
    },

    topRightCorner: {
      borderTopWidth: 2,
      borderRightWidth: 2,
      top: 0,
      right: 0
    },

    topLeftCorner: {
      borderTopWidth: 2,
      borderLeftWidth: 2,
      top: 0,
      left: 0
    },

    bottomLeftCorner: {
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      bottom: 0,
      left: 0
    },

    bottomRightCorner: {
      borderBottomWidth: 2,
      borderRightWidth: 2,
      bottom: 0,
      right: 0
    }
  });
  return (
    <View style={styles.rectangleContainer}>
      <View style={styles.rectangle}>
        <Grid>
          <Row>
            <Col>
              <View style={[styles.topLeftCorner, styles.smallBorded]} />
            </Col>
            <Col>
              <View style={[styles.topRightCorner, styles.smallBorded]} />
            </Col>
          </Row>
          <Row>
            <Col>
              <View style={[styles.bottomLeftCorner, styles.smallBorded]} />
            </Col>
            <Col>
              <View style={[styles.bottomRightCorner, styles.smallBorded]} />
            </Col>
          </Row>
        </Grid>
      </View>
    </View>
  );
};
