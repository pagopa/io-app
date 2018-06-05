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
import ROUTES from "../../navigation/routes";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type ScreenProps = {};

type Props = ScreenProps & OwnProps;

/**
 * Acquisition of the  QR code by scanner
 */
export class QRcodeAcquisitionByScannerScreen extends React.Component<
  Props,
  never
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
      container: {
        flex: 1,
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
        backgroundColor: "transparent",

        borderColor: "rgba(56,56,56,0.5)"
        // borderWidth: screenwidth/4,
      },

      outRectangle: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: screenwidth / 2,
        borderColor: "rgba(56,56,56,0.5)"
      },
      rectangle: {
        height: screenwidth / 2,
        width: screenwidth / 2,
        borderWidth: 0,
        borderColor: "transparent",
        backgroundColor: "transparent"
      },

      rectangleTR: {
        height: screenwidth / 6,
        width: screenwidth / 6,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "transparent",
        position: "absolute",
        top: 0,
        right: 0
      },

      rectangleTL: {
        height: screenwidth / 6,
        width: screenwidth / 6,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "transparent",
        position: "absolute",
        top: 0,
        left: 0
      },

      rectangleBL: {
        height: screenwidth / 6,
        width: screenwidth / 6,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "transparent",
        position: "absolute",
        bottom: 0,
        left: 0
      },

      rectangleBR: {
        height: screenwidth / 6,
        width: screenwidth / 6,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "transparent",
        position: "absolute",
        bottom: 0,
        right: 0
      }
    });

    return (
      <Container style={{ backgroundColor: variables.brandPrimaryInverted }}>
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
            containerStyle={styles.container}
            showMarker={true}
            cameraStyle={styles.camera}
            customMarker={
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle}>
                  <Grid>
                    <Row>
                      <Col>
                        <View style={styles.rectangleTL} />
                      </Col>
                      <Col>
                        <View style={styles.rectangleTR} />
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <View style={styles.rectangleBL} />
                      </Col>
                      <Col>
                        <View style={styles.rectangleBR} />
                      </Col>
                    </Row>
                  </Grid>
                </View>
              </View>
            }
          />
          <View>
            <View spacer={true} large={true} />
            <Text
              style={{
                textAlign: "center",
                paddingRight: variables.contentPadding,
                paddingLeft: variables.contentPadding
              }}
            >
              {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
            </Text>
            <View spacer={true} extralarge={true} />
          </View>
        </Container>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.WALLET_QRCODE_MANUAL_ACQUISITION
              )
            }
          >
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
