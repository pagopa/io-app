/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Button, Container, Text, View } from "native-base";
import * as React from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { ComponentProps } from "../../../types/react";

import ImagePicker from "react-native-image-picker";
import * as ReaderQR from "react-native-lewin-qrcode";
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
import { openAppSettings } from "../../../utils/appSettings";
import { decodePagoPaQrCode } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";

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

  button: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -20,
    width: screenWidth - variables.contentPadding * 2,
    backgroundColor: variables.colorWhite
  },

  camera: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    height: screenWidth,
    width: screenWidth
  },

  notAuthorizedContainer: {
    padding: variables.contentPadding,
    flex: 1,
    alignItems: "center"
  },
  notAuthorizedText: {
    textAlign: "justify",
    marginBottom: 25
  },
  notAuthorizedBtn: {
    flex: 1,
    alignSelf: "center"
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 5000;

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
    showToast(I18n.t("wallet.QRtoPay.wrongQrCode"), "danger");

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

  /**
   * Start image chooser
   */
  private showImagePicker = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };
    // Open Image Library
    ImagePicker.launchImageLibrary(options, response => {
      const path = response.path ? response.path : response.uri;
      if (path != null) {
        ReaderQR.readerQR(path)
          .then((data: string) => {
            this.onQrCodeData(data);
          })
          .catch(() => {
            this.onInvalidQrCode();
          });
      }
    });
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

  public render(): React.ReactNode {
    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: this.props.navigateToPaymentManualDataInsertion,
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    const secondaryButtonProps = {
      block: true,
      cancel: true,
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
                  <Button
                    onPress={this.showImagePicker}
                    style={styles.button}
                    bordered={true}
                  >
                    <Text>{I18n.t("wallet.QRtoPay.chooser")}</Text>
                  </Button>
                  <View spacer={true} />
                  <Text style={[styles.padded, styles.centerText]}>
                    {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
                  </Text>
                  <View spacer={true} extralarge={true} />
                </View>
              }
              // "captureAudio" enable/disable microphone permission
              cameraProps={{ ratio: "1:1", captureAudio: false }}
              // "checkAndroid6Permissions" property enables permission checking for
              // Android versions greater than 6.0 (23+).
              checkAndroid6Permissions={true}
              permissionDialogTitle={I18n.t(
                "wallet.QRtoPay.cameraUsagePermissionInfobox.title"
              )}
              permissionDialogMessage={I18n.t(
                "wallet.QRtoPay.cameraUsagePermissionInfobox.message"
              )}
              // "notAuthorizedView" is by default available on iOS systems ONLY.
              // In order to make Android systems act the same as iOSs you MUST
              // enable "checkAndroid6Permissions" property as well.
              // On devices before SDK version 23, the permissions are automatically
              // granted if they appear in the manifest, so message customization would
              // be impossible.
              notAuthorizedView={
                <View style={styles.notAuthorizedContainer}>
                  <Text style={styles.notAuthorizedText}>
                    {I18n.t("wallet.QRtoPay.enroll_cta")}
                  </Text>

                  <Button
                    onPress={openAppSettings}
                    style={styles.notAuthorizedBtn}
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
