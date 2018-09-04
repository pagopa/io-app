/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import { Either } from "fp-ts/lib/Either";
import * as t from "io-ts";
import {
  AmountInEuroCents,
  PaymentNoticeQrCodeFromString,
  RptId,
  rptIdFromPaymentNoticeQrCode
} from "italia-ts-commons/lib/pagopa";
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
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestGoBack,
  paymentRequestManualEntry,
  paymentRequestTransactionSummaryFromRptId
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentStep } from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";

type ReduxMappedStateProps = Readonly<{
  valid: boolean;
}>;

type ReduxMappedDispatchProps = Readonly<{
  showTransactionSummary: (rptId: RptId, amount: AmountInEuroCents) => void;
  insertDataManually: () => void;
  goBack: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

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

  cameraContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  camera: {
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

const QRCODE_SCANNER_REACTIVATION_TIME_MS = 2000;

const rptIdFromQrCodeString = (qrCodeString: string): Either<t.Errors, RptId> =>
  PaymentNoticeQrCodeFromString.decode(qrCodeString).chain(
    rptIdFromPaymentNoticeQrCode
  );

class ScanQrCodeScreen extends React.Component<Props, never> {
  private qrCodeRead = (data: string) => {
    const rptId = rptIdFromQrCodeString(data);
    const paymentNotice = PaymentNoticeQrCodeFromString.decode(data);
    if (rptId.isRight() && paymentNotice.isRight()) {
      // successful conversion to RptId
      this.props.showTransactionSummary(
        rptId.value,
        paymentNotice.value.amount
      );
    } // else error stating that QR code is invalid @https://www.pivotaltracker.com/story/show/159003368
    else {
      setTimeout(
        () => (this.refs.scanner as QRCodeScanner).reactivate(),
        QRCODE_SCANNER_REACTIVATION_TIME_MS
      );
    }
  };

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }
    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () => this.props.insertDataManually(),
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.goBack(),
      title: I18n.t("wallet.cancel")
    };

    return (
      <Container style={styles.white}>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.props.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.QRtoPay.byCameraTitle")}</Text>
          </Body>
        </AppHeader>
        <ScrollView bounces={false}>
          <QRCodeScanner
            onRead={(reading: { data: string }) =>
              this.qrCodeRead(reading.data)
            }
            ref="scanner" // tslint:disable-line jsx-no-string-ref
            containerStyle={styles.cameraContainer}
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
            bottomContent={
              <View>
                <View spacer={true} large={true} />
                <Text style={[styles.padded, styles.centerText]}>
                  {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
                </Text>
                <View spacer={true} extralarge={true} />
              </View>
            }
          />
        </ScrollView>
        <FooterWithButtons
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
          inlineOneThird={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  valid: getPaymentStep(state) === "PaymentStateQrCode"
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  showTransactionSummary: (rptId: RptId, amount: AmountInEuroCents) =>
    dispatch(paymentRequestTransactionSummaryFromRptId(rptId, amount)),
  insertDataManually: () => dispatch(paymentRequestManualEntry()),
  goBack: () => dispatch(paymentRequestGoBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScanQrCodeScreen);
