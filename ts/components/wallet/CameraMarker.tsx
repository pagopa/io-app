import { Col, Grid, Row } from "native-base";
import * as React from "react";

import { StyleSheet, View } from "react-native";
import { IOColors } from "../core/variables/IOColors";
import { Icon } from "../core/icons/Icon";

type MarkerState = "SCANNING" | "VALID" | "INVALID";

type Props = {
  screenWidth: number;
  state: MarkerState;
};

/**
 * Renders a square camera marker.
 *
 * This is overlayed on the camera preview of the QR code scanner.
 */
export const CameraMarker: React.SFC<Props> = ({ screenWidth, state }) => {
  const sideLength = screenWidth / 2;

  const borderLength = screenWidth / 6;

  const styles = StyleSheet.create({
    rectangleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `transparent`
    },

    rectangle: {
      height: sideLength,
      width: sideLength,
      borderWidth: 0,
      backgroundColor: `transparent`
    },

    smallBorded: {
      height: borderLength,
      width: borderLength,
      borderColor: IOColors.white,
      backgroundColor: `transparent`,
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
    },

    iconContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      opacity: 0.7
    }
  });
  return (
    <View style={styles.rectangleContainer}>
      <View style={styles.rectangle}>
        {(state === "VALID" || state === "INVALID") && (
          <View style={styles.iconContainer}>
            <Icon
              name={state === "VALID" ? "legCompleted" : "legClose"}
              size={sideLength}
              color={state === "VALID" ? "green" : "red"}
            />
          </View>
        )}
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
