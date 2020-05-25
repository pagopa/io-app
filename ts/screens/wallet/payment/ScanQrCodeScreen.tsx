import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, Dimensions, StyleSheet } from "react-native";
import ImagePicker from "react-native-image-picker";
import * as ReaderQR from "react-native-lewin-qrcode";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationEvents, NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import BlockButtons from "../../../components/ui/BlockButtons";
import { CameraMarker } from "../../../components/wallet/CameraMarker";
import I18n from "../../../i18n";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { ComponentProps } from "../../../types/react";
import { openAppSettings } from "../../../utils/appSettings";
import { decodePagoPaQrCode } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";

type Props = NavigationScreenProps & ReturnType<typeof mapDispatchToProps>;

type State = Readonly<{
  scanningState: ComponentProps<typeof CameraMarker>["state"];
  isScreenFocused: boolean;
}>;

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

// Delay for reactivating the QR scanner after a scan
const QRCODE_SCANNER_REACTIVATION = 5000 as Millisecond;

// Qr scanner height is based on screen height to prevent the
// user has to scroll to read the bottom content (4 lines text on iPhone 6)
const getScannerHeight = () => {
  const footerHeight = variables.btnHeight * 2 + variables.spacerHeight;
  const availableHeight =
    screenHeight - variables.appHeaderHeight - footerHeight;
  const minScannerHeight = (availableHeight * 2) / 3;
  return minScannerHeight >= screenWidth ? screenWidth : minScannerHeight;
};

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
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
    height: getScannerHeight(),
    width: screenWidth
  },
  notAuthorizedContainer: {
    padding: variables.contentPadding,
    height: screenHeight // it prevents CameraBottomContent is displayed if we haven't camera permissions
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};

/**
 * A screen to identify a transaction by scanning the QR Code on the analogic notice
 */
class ScanQrCodeScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      scanningState: "SCANNING",
      isScreenFocused: false
    };
  }

  private scannerReactivateTimeoutHandler?: number;

  private qrCodeScanner = React.createRef<QRCodeScanner>();

  /**
   * Handles valid pagoPA QR Codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.setState({
      scanningState: "VALID"
    });
    this.props.runPaymentTransactionSummarySaga(data.e1, data.e2);
  };

  /**
   * Handles invalid pagoPA QR Codes
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
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
    }, QRCODE_SCANNER_REACTIVATION);
  };

  // Gets called by the QR Code reader on new QR Code reads
  private onQrCodeData = (data: string) => {
    const resultOrError = decodePagoPaQrCode(data);
    resultOrError.foldL<void>(this.onInvalidQrCode, this.onValidQrCode);
  };

  // Start image chooser (from gallery)
  private showImagePicker = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: "images"
      },
      // PermissionDenied message only for Android
      permissionDenied: {
        title: I18n.t("wallet.QRtoPay.settingsAlert.title"),
        text: I18n.t("wallet.QRtoPay.settingsAlert.message"),
        okTitle: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
        reTryTitle: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings")
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
      } else if (response.error !== undefined) {
        // Alert to invite user to enable the permissions
        Alert.alert(
          I18n.t("wallet.QRtoPay.settingsAlert.title"),
          I18n.t("wallet.QRtoPay.settingsAlert.message"),
          [
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings"),
              onPress: openAppSettings
            }
          ],
          { cancelable: false }
        );
      } // else if the user has not selected a file, do nothing
    });
  };

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

  private renderFooterButtons = () => {
    return (
      <View footer={true}>
        <BlockButtons
          type={"SingleButton"}
          leftButton={{
            onPress: this.showImagePicker,
            title: I18n.t("wallet.QRtoPay.chooser"),
            primary: true
          }}
        />
        <View spacer={true} />
        <BlockButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            cancel: true,
            onPress: this.props.navigation.goBack,
            title: I18n.t("global.buttons.cancel")
          }}
          rightButton={{
            primary: true,
            bordered: true,
            onPress: this.props.navigateToPaymentManualDataInsertion,
            title: I18n.t("wallet.QRtoPay.setManually")
          }}
        />
      </View>
    );
  };

  private CameraBottomContent = (
    <React.Fragment>
      <View spacer={true} />
      <Text alignCenter={true} style={styles.padded}>
        <Text bold={true}>{I18n.t("wallet.QRtoPay.info.block1")}</Text>
        <Text>{` ${I18n.t("wallet.QRtoPay.info.block2")}`}</Text>
        <Text bold={true}>{` ${I18n.t("wallet.QRtoPay.info.block3")}`}</Text>
        <Text>{` ${I18n.t("wallet.QRtoPay.info.block4")}`}</Text>
      </Text>
      <View spacer={true} extralarge={true} />
    </React.Fragment>
  );

  private CameraNotAuthorizedView = (
    <View style={styles.notAuthorizedContainer}>
      <Text>
        {I18n.t("wallet.QRtoPay.enroll_cta.block1")}
        <Text bold={true}>{` ${I18n.t(
          "wallet.QRtoPay.enroll_cta.block2"
        )}`}</Text>
        <Text>{` ${I18n.t("wallet.QRtoPay.enroll_cta.block3")}`}</Text>
      </Text>
      <Text link={true} onPress={openAppSettings}>
        {I18n.t("biometric_recognition.enroll_btnLabel")}
      </Text>
    </View>
  );

  private onRead = (reading: { data: string }) => {
    this.onQrCodeData(reading.data);
  };

  private handleDidFocus = () => this.setState({ isScreenFocused: true });

  private handleWillBlur = () => this.setState({ isScreenFocused: false });

  public render(): React.ReactNode {
    return (
      <BaseScreenComponent
        headerTitle={I18n.t("wallet.QRtoPay.byCameraTitle")}
        goBack={this.props.navigation.goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet"]}
      >
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillBlur={this.handleWillBlur}
        />
        <Content bounces={false} noPadded={true} scrollEnabled={false}>
          {this.state.isScreenFocused && (
            <QRCodeScanner
              onRead={this.onRead}
              ref={this.qrCodeScanner}
              containerStyle={styles.cameraContainer}
              showMarker={true}
              cameraStyle={styles.camera}
              customMarker={
                <CameraMarker
                  screenWidth={screenWidth}
                  state={this.state.scanningState}
                />
              }
              bottomContent={this.CameraBottomContent}
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
              notAuthorizedView={this.CameraNotAuthorizedView}
            />
          )}
        </Content>
        {this.renderFooterButtons()}
      </BaseScreenComponent>
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
