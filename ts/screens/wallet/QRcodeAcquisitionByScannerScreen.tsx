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

type State = Readonly<{
  data: string;
}>;

export class QRcodeAcquisitionByScannerScreen extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    const screenwidth = Dimensions.get("screen").width;

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
        height: (screenwidth * 4) / 3,
        width: screenwidth
      },

      rectangleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
      },

      rectangle: {
        height: screenwidth / 2,
        width: screenwidth / 2,
        borderWidth: 0,
        backgroundColor: "transparent"
      },

      smallBorded: {
        height: screenwidth / 6,
        width: screenwidth / 6,
        borderColor: variables.brandPrimaryInverted,
        backgroundColor: "transparent",
        position: "absolute"
      },

      rectangleTR: {
        borderTopWidth: 2,
        borderRightWidth: 2,
        top: 0,
        right: 0
      },

      rectangleTL: {
        borderTopWidth: 2,
        borderLeftWidth: 2,
        top: 0,
        left: 0
      },

      rectangleBL: {
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        bottom: 0,
        left: 0
      },

      rectangleBR: {
        borderBottomWidth: 2,
        borderRightWidth: 2,
        bottom: 0,
        right: 0
      }
    });

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
                          style={[styles.rectangleTL, styles.smallBorded]}
                        />
                      </Col>
                      <Col>
                        <View
                          style={[styles.rectangleTR, styles.smallBorded]}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <View
                          style={[styles.rectangleBL, styles.smallBorded]}
                        />
                      </Col>
                      <Col>
                        <View
                          style={[styles.rectangleBR, styles.smallBorded]}
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
            <Text>{I18n.t("wallet.QRtoPay.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
