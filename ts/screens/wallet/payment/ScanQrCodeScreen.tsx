/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Button, Container, Text, Toast, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { ComponentProps } from "../../../types/react";

import { BaseHeader } from "../../../components/screens/BaseHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { CameraMarker } from "../../../components/wallet/CameraMarker";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { decodePagoPaQrCode } from "../../../utils/payment";

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  scanningState: ComponentProps<typeof CameraMarker>["state"];
  isFocused: boolean;
};

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
    height: screenWidth,
    width: screenWidth
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 1000;

class ScanQrCodeScreen extends React.Component<Props, State> {
  private scannerReactivateTimeoutHandler?: number;

  /**
   * Handles valid PagoPA QR codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.setState({
      scanningState: "VALID"
    });
    this.props.runPaymentTransactionSummarySaga(data.e1, data.e2);
  };

  /**
   * Handles invalid PagoPA QR codes
   */
  private onInvalidQrCode = () => {
    Toast.show({
      text: I18n.t("wallet.QRtoPay.wrongQrCode"),
      type: "danger"
    });

    this.setState({
      scanningState: "INVALID"
    });
    // tslint:disable-next-line:no-object-mutation
    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // tslint:disable-next-line:no-object-mutation
      this.scannerReactivateTimeoutHandler = undefined;
      (this.refs.scanner as QRCodeScanner).reactivate();
      this.setState({
        scanningState: "SCANNING"
      });
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);
  };

  /**
   * Gets called by the QR code reader on new QR code reads
   */
  private onQrCodeData = (data: string) => {
    const resultOrError = decodePagoPaQrCode(data);
    resultOrError.foldL<void>(this.onInvalidQrCode, this.onValidQrCode);
  };

  public constructor(props: Props) {
    super(props);
    this.state = {
      scanningState: "SCANNING",
      isFocused: false
    };
  }

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

  private handleDidFocus = () => this.setState({ isFocused: true });

  private handleWillBlur = () => this.setState({ isFocused: false });

  private openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings://notification/IO").catch(_ => undefined);
    } else {
      AndroidOpenSettings.appDetailsSettings();
    }
  };

  public render(): React.ReactNode {
    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: this.props.navigateToPaymentManualDataInsertion,
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    const secondaryButtonProps = {
      block: true,
      bordered: true,
      onPress: this.props.navigateToWalletHome,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container style={styles.white}>
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillBlur={this.handleWillBlur}
        />
        <BaseHeader
          goBack={true}
          headerTitle={I18n.t("wallet.QRtoPay.byCameraTitle")}
        />
        <ScrollView bounces={false}>
          {this.state.isFocused && (
            <QRCodeScanner
              onRead={(reading: { data: string }) =>
                this.onQrCodeData(reading.data)
              }
              ref="scanner" // tslint:disable-line jsx-no-string-ref
              containerStyle={styles.cameraContainer}
              showMarker={true}
              cameraStyle={styles.camera}
              customMarker={
                <CameraMarker
                  screenWidth={screenWidth}
                  state={this.state.scanningState}
                />
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
              cameraProps={{ ratio: "1:1" }}
              checkAndroid6Permissions={true}
              permissionDialogTitle={I18n.t(
                "wallet.QRtoPay.cameraUsagePerissionInfobox.title"
              )}
              permissionDialogMessage={I18n.t(
                "wallet.QRtoPay.cameraUsagePerissionInfobox.message"
              )}
              notAuthorizedView={
                <View
                  style={{
                    padding: variables.contentPadding,
                    flex: 1,
                    alignItems: "center"
                  }}
                >
                  <Text
                    style={{
                      textAlign: "justify",
                      marginBottom: 25
                    }}
                  >
                    {I18n.t("wallet.QRtoPay.enroll_cta")}
                  </Text>

                  <Button
                    onPress={this.openAppSettings}
                    style={{
                      flex: 1,
                      alignSelf: "center"
                    }}
                  >
                    <Text>
                      {I18n.t("biometric_recognition.enroll_btnLabel")}
                    </Text>
                  </Button>
                </View>
              }
            />
          )}
        </ScrollView>
        <FooterWithButtons
          type="TwoButtonsInlineThird"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
        />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome()),
  navigateToPaymentManualDataInsertion: () =>
    dispatch(navigateToPaymentManualDataInsertion()),
  runPaymentTransactionSummarySaga: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());
    dispatch(
      navigateToPaymentTransactionSummaryScreen({
        rptId,
        initialAmount
      })
    );
  }
});

export default connect(
  undefined,
  mapDispatchToProps
)(ScanQrCodeScreen);
