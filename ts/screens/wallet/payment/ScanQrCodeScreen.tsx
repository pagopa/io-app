/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import { head } from "fp-ts/lib/Array";
import { fromNullable, isSome } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";

import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker/src/types";
import * as ReaderQR from "react-native-lewin-qrcode";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
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
import customVariables from "../../../theme/variables";
import { ComponentProps } from "../../../types/react";
import { openAppSettings } from "../../../utils/appSettings";
import { AsyncAlert } from "../../../utils/asyncAlert";
import { decodePagoPaQrCode } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../components/core/variables/IOStyles";

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  scanningState: ComponentProps<typeof CameraMarker>["state"];
  isFocused: boolean;
  // The package react-native-qrcode-scanner automatically asks for android permission, but we have to display before an alert with
  // the rationale
  permissionRationaleDisplayed: boolean;
};

const screenWidth = Dimensions.get("screen").width;
const cameraTextOverlapping = 20;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  white: {
    backgroundColor: variables.brandPrimaryInverted
  },

  bottomText: {
    paddingTop: cameraTextOverlapping
  },

  content: {
    backgroundColor: variables.colorWhite,
    marginTop: -cameraTextOverlapping,
    zIndex: 1
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
    marginTop: -cameraTextOverlapping,
    width: screenWidth - variables.contentPadding * 2,
    backgroundColor: variables.colorWhite,
    zIndex: 999
  },

  camera: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    width: screenWidth
  },

  notAuthorizedContainer: {
    padding: variables.contentPadding,
    flex: 1,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 14
  },
  notAuthorizedText: {
    marginBottom: 25
  },
  notAuthorizedBtn: {
    flex: 1,
    alignSelf: "stretch"
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 5000;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};
class ScanQrCodeScreen extends React.Component<Props, State> {
  private scannerReactivateTimeoutHandler?: number;
  private goBack = () => this.props.navigation.goBack();
  private qrCodeScanner = React.createRef<QRCodeScanner>();

  /**
   * Handles valid pagoPA QR codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.setState({
      scanningState: "VALID"
    });
    this.props.runPaymentTransactionSummarySaga(data.e1, data.e2);
  };

  /**
   * Handles invalid pagoPA QR codes
   */
  private onInvalidQrCode = () => {
    showToast(I18n.t("wallet.QRtoPay.wrongQrCode"), "danger");

    this.setState({
      scanningState: "INVALID"
    });
    // eslint-disable-next-line
    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;
      if (this.qrCodeScanner.current) {
        this.qrCodeScanner.current.reactivate();
        this.setState({
          scanningState: "SCANNING"
        });
      }
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
    const options: ImageLibraryOptions = {
      mediaType: "photo"
    };
    // Open Image Library
    ImagePicker.launchImageLibrary(options, response => {
      // With the current settings the user is allowed to pick only one image
      const maybePickedImage = fromNullable(response.assets).chain(assets =>
        head([...assets])
      );
      if (isSome(maybePickedImage)) {
        ReaderQR.readerQR(maybePickedImage.value.uri)
          .then((data: string) => {
            this.onQrCodeData(data);
          })
          .catch(() => {
            this.onInvalidQrCode();
          });
      } else if (response.errorMessage !== undefined) {
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

  public constructor(props: Props) {
    super(props);
    this.state = {
      scanningState: "SCANNING",
      isFocused: false,
      permissionRationaleDisplayed: Platform.OS !== "android"
    };
  }

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

  public async componentDidMount() {
    if (Platform.OS !== "android") {
      return;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (!hasPermission) {
      await AsyncAlert(
        I18n.t("permissionRationale.camera.title"),
        I18n.t("permissionRationale.camera.message"),
        [
          {
            text: I18n.t("global.buttons.choose"),
            style: "default"
          }
        ]
      );
    }
    this.setState({ permissionRationaleDisplayed: true });
  }

  private handleWillFocus = () => this.setState({ isFocused: true });

  private handleWillBlur = () => this.setState({ isFocused: false });

  public render(): React.ReactNode {
    const primaryButtonProps = {
      buttonFontSize: customVariables.btnFontSize - 1,
      block: true,
      primary: true,
      onPress: this.props.navigateToPaymentManualDataInsertion,
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    return (
      <BaseScreenComponent
        headerTitle={I18n.t("wallet.QRtoPay.byCameraTitle")}
        goBack={this.goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet"]}
      >
        <NavigationEvents
          onWillFocus={this.handleWillFocus}
          onWillBlur={this.handleWillBlur}
        />
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView bounces={false}>
            {this.state.isFocused && this.state.permissionRationaleDisplayed && (
              <QRCodeScanner
                onRead={(reading: { data: string }) =>
                  this.onQrCodeData(reading.data)
                }
                ref={this.qrCodeScanner}
                containerStyle={styles.cameraContainer as any}
                showMarker={true}
                cameraStyle={styles.camera as any}
                customMarker={
                  <CameraMarker
                    screenWidth={screenWidth}
                    state={this.state.scanningState}
                  />
                }
                bottomContent={
                  <View>
                    <ButtonDefaultOpacity
                      onPress={this.showImagePicker}
                      style={styles.button}
                      bordered={true}
                    >
                      <Text>{I18n.t("wallet.QRtoPay.chooser")}</Text>
                    </ButtonDefaultOpacity>
                    <View style={styles.content}>
                      <View spacer={true} />
                      <Text style={[styles.padded, styles.bottomText]}>
                        {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
                      </Text>
                      <View spacer={true} extralarge={true} />
                    </View>
                  </View>
                }
                // "captureAudio" enable/disable microphone permission
                cameraProps={{ captureAudio: false }}
                // "checkAndroid6Permissions" property enables permission checking for
                // Android versions greater than 6.0 (23+).
                checkAndroid6Permissions={true}
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

                    <ButtonDefaultOpacity
                      onPress={openAppSettings}
                      style={styles.notAuthorizedBtn}
                    >
                      <Text>{I18n.t("global.buttons.settings")}</Text>
                    </ButtonDefaultOpacity>
                  </View>
                }
              />
            )}
          </ScrollView>
          <FooterWithButtons
            type="TwoButtonsInlineThird"
            leftButton={cancelButtonProps(
              this.props.navigation.goBack,
              I18n.t("global.buttons.cancel")
            )}
            rightButton={primaryButtonProps}
          />
        </SafeAreaView>
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
        initialAmount,
        paymentStartOrigin: "qrcode_scan"
      })
    );
  }
});

export default connect(undefined, mapDispatchToProps)(ScanQrCodeScreen);
