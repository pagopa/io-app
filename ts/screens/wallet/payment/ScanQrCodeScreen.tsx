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
import { NavigationEvents, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { InstabugButtons } from "../../../components/InstabugButtons";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { CameraMarker } from "../../../components/wallet/CameraMarker";

import I18n from "../../../i18n";

import { Dispatch } from "../../../store/actions/types";

import variables from "../../../theme/variables";

import { ComponentProps } from "../../../types/react";

import { decodePagoPaQrCode } from "../../../utils/payment";

import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen
} from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";

type ReduxMappedDispatchProps = Readonly<{
  runPaymentTransactionSummarySaga: (
    rptId: RptId,
    amount: AmountInEuroCents
  ) => void;
}>;

type OwnProps = NavigationInjectedProps;

type Props = OwnProps & ReduxMappedDispatchProps;

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
  private scannerReactivateTimeoutHandler: number | undefined;

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

  public render(): React.ReactNode {
    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () => {
        this.props.navigation.dispatch(navigateToPaymentManualDataInsertion());
      },
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    const secondaryButtonProps = {
      block: true,
      bordered: true,
      onPress: () => this.props.navigation.goBack(),
      title: I18n.t("wallet.cancel")
    };

    return (
      <Container style={styles.white}>
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillBlur={this.handleWillBlur}
        />
        <AppHeader>
          <Left>
            <Button
              transparent={true}
              onPress={() => this.props.navigation.goBack()}
            >
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
            />
          )}
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

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
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
