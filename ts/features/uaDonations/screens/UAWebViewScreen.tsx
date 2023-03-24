import {
  AmountInEuroCents,
  PaymentNoticeNumber,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import React, { useEffect, useState } from "react";
import {
  View,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import WebView from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import dataErrorImage from "../../../../img/pictograms/doubt.png";
import genericErrorImage from "../../../../img/wallet/errors/generic-error-icon.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch } from "../../../store/hooks";
import { checkoutUADonationsUrl } from "../../../urls";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { showToast } from "../../../utils/showToast";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { isHttp, openWebUrl } from "../../../utils/url";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { UADonationWebViewMessage } from "../types";

export type UAWebviewScreenNavigationParams = Readonly<{
  urlToLoad: string;
}>;

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

type ErrorComponentProps = {
  onRetry: () => void;
  errorText: string;
  buttonTitle: string;
  image: React.ReactNode;
};
const ErrorComponent: React.FunctionComponent<ErrorComponentProps> = props => {
  const buttonProps: BlockButtonProps = {
    primary: true,
    title: props.buttonTitle,
    onPress: props.onRetry
  };
  return (
    <>
      <InfoScreenComponent image={props.image} title={props.errorText} />
      <FooterWithButtons type={"SingleButton"} leftButton={buttonProps} />
    </>
  );
};

// a loading component rendered during the webview loading states
const renderLoading = () => (
  <View style={styles.loading}>
    <RefreshIndicator />
  </View>
);

/**
 * show a toast to inform about the occurred error
 */
const handleError = () => showToast(I18n.t("global.genericError"));

/**
 * parse the messages coming from the webview
 * if some messages are recognized as valid, it handles the relative action
 * @param event
 * @param onPaymentPayload
 */
const handleOnMessage = (
  event: WebViewMessageEvent,
  onPaymentPayload: (rptID: RptId, amount: AmountInEuroCents) => void
) => {
  const maybeMessage = UADonationWebViewMessage.decode(
    JSON.parse(event.nativeEvent.data)
  );
  if (E.isLeft(maybeMessage)) {
    void mixpanelTrack("UADONATIONS_WEBVIEW_DECODE_ERROR", {
      reason: `decoding error: ${readableReport(maybeMessage.left)}`
    });
    handleError();
    return;
  }
  switch (maybeMessage.right.kind) {
    case "webUrl":
      const webUrl = maybeMessage.right.payload;
      void mixpanelTrack("UADONATIONS_WEBVIEW_OPEN_WEBURL_REQUEST", {
        url: webUrl
      });
      openWebUrl(webUrl, () => {
        void mixpanelTrack("UADONATIONS_WEBVIEW_OPEN_WEBURL_ERROR", {
          url: maybeMessage.right.payload
        });
        handleError();
      });
      break;
    case "payment":
      const { nav, cf, amount } = maybeMessage.right.payload;
      void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_DECODE_REQUEST", {
        organizationFiscalCode: cf,
        paymentNoticeNumber: PaymentNoticeNumberFromString.encode(nav),
        amount
      });
      const maybeRptId = RptId.decode({
        paymentNoticeNumber: nav,
        organizationFiscalCode: cf
      });
      const maybeAmount = AmountInEuroCents.decode(amount.toString());
      if (E.isLeft(maybeRptId) || E.isLeft(maybeAmount)) {
        const reason = E.isLeft(maybeRptId)
          ? maybeRptId.left
          : E.isLeft(maybeAmount)
          ? maybeAmount.left
          : maybeAmount.right;
        void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_DECODE_ERROR", {
          reason
        });
        handleError();
        return;
      }
      void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_DECODE_SUCCESS", {
        organizationFiscalCode: maybeRptId.right.organizationFiscalCode,
        paymentNoticeNumber: PaymentNoticeNumber.encode(
          maybeRptId.right.paymentNoticeNumber
        ),
        amount: maybeAmount.right
      });
      onPaymentPayload(maybeRptId.right, maybeAmount.right);
      break;
    case "error":
      const error = maybeMessage.right.payload;
      void mixpanelTrack("UADONATIONS_WEBVIEW_REPORT_ERROR", {
        reason: error
      });
      handleError();
      break;
  }
};

const injectedJavascript = closeInjectedScript(AVOID_ZOOM_JS);

/**
 * this screen embeds a webview that loads a uri url retrieved from internalRouteNavigation store section (urlToLoad)
 * it handles also the messages sent from the web page to trigger the payment flow
 * @constructor
 */
export const UAWebViewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route =
    useRoute<
      Route<"UADONATION_ROUTES_WEBVIEW", UAWebviewScreenNavigationParams>
    >();
  const dispatch = useIODispatch();
  const uri = route.params.urlToLoad;
  const ref = React.createRef<WebView>();
  /**
   * errors type
   * - webview: errors coming from the webpage
   * - data: unexpected data from navigation params (empty or malformed)
   */
  const [errorType, setErrorType] = useState<"webview" | "data" | undefined>();

  useEffect(() => {
    if (Platform.OS === "ios") {
      Linking.openURL(checkoutUADonationsUrl).catch(_ =>
        showToast(I18n.t("genericError"))
      );
      navigation.goBack();
    }

    if (uri === undefined) {
      setErrorType("data");
    } else {
      const urlParsed = new URLParse(uri);
      // url malformed
      if (isStringNullyOrEmpty(urlParsed.host) || !isHttp(urlParsed.origin)) {
        setErrorType("data");
      }
    }
  }, [uri, navigation]);

  // trigger the payment flow within the given data
  const startDonationPayment = (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());
    navigateToPaymentTransactionSummaryScreen({
      rptId,
      initialAmount,
      paymentStartOrigin: "donation"
    });
  };

  // inject JS to avoid the user can zoom the web page content
  const injectJS = () => {
    ref.current?.injectJavaScript(injectedJavascript);
  };

  const onError = () => {
    setErrorType("webview");
  };

  const getErrorComponent = (error: NonNullable<typeof errorType>) => {
    switch (error) {
      case "webview":
        return (
          <ErrorComponent
            image={renderInfoRasterImage(genericErrorImage)}
            errorText={I18n.t("wallet.errors.GENERIC_ERROR")}
            buttonTitle={I18n.t("global.buttons.retry")}
            onRetry={() => {
              ref.current?.reload();
              setErrorType(undefined);
            }}
          />
        );
      case "data":
        return (
          <ErrorComponent
            image={renderInfoRasterImage(dataErrorImage)}
            buttonTitle={I18n.t(
              "features.uaDonations.webViewScreen.errors.data.buttonTitle"
            )}
            errorText={I18n.t("wallet.errors.GENERIC_ERROR")}
            onRetry={() => {
              navigation.goBack();
            }}
          />
        );
    }
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.uaDonations.webViewScreen.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex}>
        {errorType === undefined && uri && (
          <WebView
            testID={"UAWebViewScreenTestID"}
            ref={ref}
            cacheEnabled={false}
            textZoom={100}
            source={{ uri }}
            onLoadEnd={injectJS}
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            onError={onError}
            onHttpError={onError}
            onMessage={e => handleOnMessage(e, startDonationPayment)}
            startInLoadingState={true}
            renderLoading={renderLoading}
            javaScriptEnabled={true}
          />
        )}
        {errorType && getErrorComponent(errorType)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
