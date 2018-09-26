/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 * TODO: "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import {
  Body,
  Button,
  Container,
  Icon,
  Left,
  Right,
  Text,
  Toast,
  View
} from "native-base";
import * as React from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestGoBack,
  paymentRequestManualEntry,
  paymentRequestTransactionSummaryFromRptId
} from "../../../store/actions/wallet/payment";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentStep } from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import { ComponentProps } from "../../../types/react";
import { decodePagoPaQrCode } from "../../../utils/payment";
import { CameraMarker } from "./CameraMarker";

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

type State = {
  scanningState: ComponentProps<typeof CameraMarker>["state"];
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
    height: (screenWidth * 4) / 3,
    width: screenWidth
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 1000;

class ScanQrCodeScreen extends React.PureComponent<Props, State> {
  private scannerReactivateTimeoutHandler: number | undefined;

  /**
   * Handles valid PagoPA QR codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.setState({
      scanningState: "VALID"
    });
    this.props.showTransactionSummary(data.e1, data.e2);
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
      scanningState: "SCANNING"
    };
  }

  public shouldComponentUpdate(nextProps: Props) {
    // avoids updating the component on invalid props to avoid having the screen
    // become blank during transitions from one payment state to another
    // FIXME: this is quite fragile, we should instead avoid having a shared state
    return nextProps.valid;
  }

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

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
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>
        <ScrollView bounces={false}>
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

export default withLoadingSpinner(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ScanQrCodeScreen),
  createLoadingSelector(["PAYMENT_LOAD"]),
  {}
);
