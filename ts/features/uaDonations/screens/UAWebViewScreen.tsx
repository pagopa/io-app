import WebView from "react-native-webview";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { View } from "native-base";
import URLParse from "url-parse";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { internalRouteNavigationParamsSelector } from "../../../store/reducers/internalRouteNavigation";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { UADonationWebViewMessage } from "../types";
import { openWebUrl } from "../../../utils/url";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { navigateToPaymentTransactionSummaryScreen } from "../../../store/actions/navigation";

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

const ErrorComponent = (props: { onRetry: () => void }) => (
  <LoadingErrorComponent
    loadingCaption={""}
    isLoading={false}
    onRetry={props.onRetry}
  />
);

// a loading component rendered during the webview loading states
const renderLoading = () => (
  <View style={styles.loading}>
    <RefreshIndicator />
  </View>
);

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
    // TODO trace decoding errors https://pagopa.atlassian.net/browse/IA-701
    return;
  }
  switch (maybeMessage.value.kind) {
    case "webUrl":
      openWebUrl(maybeMessage.value.payload, () => {
        // TODO trace open web url errors https://pagopa.atlassian.net/browse/IA-701
      });
      break;
    case "payment":
      const { nav, cf, amount } = maybeMessage.value.payload;
      const maybeRptId = RptId.decode({
        paymentNoticeNumber: nav,
        organizationFiscalCode: cf
      });
      const maybeAmount = AmountInEuroCents.decode(amount.toString());
      if (maybeRptId.isLeft() || maybeAmount.isLeft()) {
        // TODO trace decoding errors https://pagopa.atlassian.net/browse/IA-701
        return;
      }
      onPaymentPayload(maybeRptId.value, maybeAmount.value);
      break;
    case "error":
      // const error = maybeMessage.value.payload;
      // TODO trace web page errors https://pagopa.atlassian.net/browse/IA-701
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
  const dispatch = useIODispatch();
  const uri = navigationParams?.urlToLoad;
  const ref = React.createRef<WebView>();
  const [hasError, setError] = useState(false);
  const errorComponent = (
    <ErrorComponent
      onRetry={() => {
        ref.current?.reload();
        setError(false);
      }}
    />
  );

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
    setError(true);
  };

  if (uri === undefined) {
    // TODO show an alert to inform the failure scenario https://pagopa.atlassian.net/browse/IA-706
    return null;
  }
  const urlParsed = new URLParse(uri);
  // url malformed
  if (isStringNullyOrEmpty(urlParsed.host)) {
    // TODO show an alert to inform the failure scenario https://pagopa.atlassian.net/browse/IA-706
    return null;
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.uaDonations.webViewScreen.headerTitle")}
    >
      {!hasError ? (
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
      ) : (
        errorComponent
      )}
    </BaseScreenComponent>
  );
};
