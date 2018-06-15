/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import {
  Body,
  Button,
  Col,
  Container,
  Grid,
  Icon,
  Left,
  Row,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Dimensions, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  white: {
    backgroundColor: variables.brandPrimaryInverted
  },

  centerText: {
    textAlign: "center"
  },

  cameraCcontainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  camera: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    height: (screenWidth * 4) / 3,
    width: screenWidth
  },

  rectangleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  rectangle: {
    height: screenWidth / 2,
    width: screenWidth / 2,
    borderWidth: 0,
    backgroundColor: "transparent"
  },

  smallBorded: {
    height: screenWidth / 6,
    width: screenWidth / 6,
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

export class QRcodeAcquisitionByScannerScreen extends React.Component<
  Props,
  never
> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container style={styles.white}>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.QRtoPay.byCameraTitle")}</Text>
          </Body>
        </AppHeader>
        <Container>
          <QRCodeScanner
            containerStyle={styles.cameraCcontainer}
            showMarker={true}
            cameraStyle={styles.camera}
            customMarker={
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle}>
                  <Grid>
                    <Row>
                      <Col>
                        <View
                          style={[styles.topLeftCorner, styles.smallBorded]}
                        />
                      </Col>
                      <Col>
                        <View
                          style={[styles.topRightCorner, styles.smallBorded]}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <View
                          style={[styles.bottomLeftCorner, styles.smallBorded]}
                        />
                      </Col>
                      <Col>
                        <View
                          style={[styles.bottomRightCorner, styles.smallBorded]}
                        />
                      </Col>
                    </Row>
                  </Grid>
                </View>
              </View>
            }
          />
          <View>
            <View spacer={true} large={true} />
            <Text style={[styles.padded, styles.centerText]}>
              {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
            </Text>
            <View spacer={true} extralarge={true} />
          </View>
        </Container>
        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("wallet.QRtoPay.setManually")}</Text>
          </Button>
          <Button block={true} light={true} onPress={() => this.goBack()}>
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
