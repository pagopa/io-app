import WebView from "react-native-webview";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { View } from "native-base";
import URLParse from "url-parse";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import {
  AmountInEuroCents,
  PaymentNoticeNumber,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { isHttp, openWebUrl } from "../../../utils/url";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";
import { showToast } from "../../../utils/showToast";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import genericErrorImage from "../../../../img/wallet/errors/generic-error-icon.png";
import dataErrorImage from "../../../../img/pictograms/doubt.png";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { BlockButtonProps } from "../../../components/ui/BlockButtons";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { UADonationWebViewMessage } from "../types";
import { mixpanelTrack } from "../../../mixpanel";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { internalRouteNavigationParamsSelector } from "../../../store/reducers/internalRouteNavigation";

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
  },
  errorContainer: {
    flex: 1,
    alignItems: "center"
  },
  errorTitle: {
    marginTop: 10
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
  if (maybeMessage.isLeft()) {
    void mixpanelTrack("UADONATIONS_WEBVIEW_DECODE_ERROR", {
      reason: `decoding error: ${readableReport(maybeMessage.value)}`
    });
    handleError();
    return;
  }
  switch (maybeMessage.value.kind) {
    case "webUrl":
      const webUrl = maybeMessage.value.payload;
      void mixpanelTrack("UADONATIONS_WEBVIEW_OPEN_WEBURL_REQUEST", {
        url: webUrl
      });
      openWebUrl(webUrl, () => {
        void mixpanelTrack("UADONATIONS_WEBVIEW_OPEN_WEBURL_ERROR", {
          url: maybeMessage.value.payload
        });
        handleError();
      });
      break;
    case "payment":
      const { nav, cf, amount } = maybeMessage.value.payload;
      void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_REQUEST", {
        organizationFiscalCode: cf,
        paymentNoticeNumber: PaymentNoticeNumberFromString.encode(nav),
        amount
      });
      const maybeRptId = RptId.decode({
        paymentNoticeNumber: nav,
        organizationFiscalCode: cf
      });
      const maybeAmount = AmountInEuroCents.decode(amount.toString());
      if (maybeRptId.isLeft() || maybeAmount.isLeft()) {
        const reason = maybeRptId.isLeft()
          ? maybeRptId.value
          : maybeAmount.value;
        void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_DECODE_ERROR", {
          reason
        });
        handleError();
        return;
      }
      void mixpanelTrack("UADONATIONS_WEBVIEW_PAYMENT_DECODE_SUCCESS", {
        organizationFiscalCode: maybeRptId.value.organizationFiscalCode,
        paymentNoticeNumber: PaymentNoticeNumber.encode(
          maybeRptId.value.paymentNoticeNumber
        ),
        amount: maybeAmount.value
      });
      onPaymentPayload(maybeRptId.value, maybeAmount.value);
      break;
    case "error":
      const error = maybeMessage.value.payload;
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
  const navigationParams = useIOSelector(internalRouteNavigationParamsSelector);
  const navigation = useNavigationContext();
  const dispatch = useIODispatch();
  const uri = navigationParams?.urlToLoad;
  const ref = React.createRef<WebView>();
  /**
   * errors type
   * - webview: errors coming from the webpage
   * - data: unexpected data from navigation params (empty or malformed)
   */
  const [errorType, setErrorType] = useState<"webview" | "data" | undefined>();

  useEffect(() => {
    if (uri === undefined) {
      setErrorType("data");
    } else {
      const urlParsed = new URLParse(uri);
      // url malformed
      if (isStringNullyOrEmpty(urlParsed.host) || !isHttp(urlParsed.origin)) {
        setErrorType("data");
      }
    }
  }, [uri]);

  // trigger the payment flow within the given data
  const startDonationPayment = (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());
    navigateToPaymentTransactionSummaryScreen({
      rptId,
      initialAmount,
      paymentStartOrigin: "donation",
      startRoute: undefined
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
              navigation.goBack(null);
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
