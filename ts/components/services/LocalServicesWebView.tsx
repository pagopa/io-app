import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { localServicesWebUrl } from "../../config";
import { useTabItemPressWhenScreenActive } from "../../hooks/useTabItemPressWhenScreenActive";
import I18n from "../../i18n";
import { loadServiceDetail } from "../../store/actions/services";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import { isStrictSome } from "../../utils/pot";
import { showToast } from "../../utils/showToast";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../utils/webview";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { withLightModalContext } from "../helpers/withLightModalContext";
import GenericErrorComponent from "../screens/GenericErrorComponent";
import { RefreshIndicator } from "../ui/RefreshIndicator";

type Props = {
  onServiceSelect: (service: ServicePublic) => void;
} & ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const opaqueBgColor = hexToRgba(IOColors.white, 0.5);

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: opaqueBgColor,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  genericError: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  webView: {
    flex: 1,
    opacity: Platform.OS === "android" ? 0.99 : 1 // Android workaround to avoid crashing when navigating out of a WebView
  }
});
const renderLoading = () => (
  <View style={styles.refreshIndicatorContainer}>
    <RefreshIndicator />
  </View>
);

/**
 * This component is basically a webview that loads an url showing local services
 * It intercepts the request of loading a service and it does:
 * - block that request from loading
 * - extract from the request url the service id
 * - load the selected service starting from the service id (load and error are handled)
 */
const LocalServicesWebView = (props: Props) => {
  const [serviceIdToLoad, setServiceIdToLoad] = React.useState<
    string | undefined
  >(undefined);
  const [webViewError, setWebViewError] = React.useState<boolean>(false);
  const webViewRef = React.createRef<WebView>();

  const scrollWebview = (x: number, y: number) => {
    const script = `window.scrollTo(${x}, ${y})`;
    webViewRef.current?.injectJavaScript(script);
  };

  useTabItemPressWhenScreenActive(() => scrollWebview(0, 0), true);

  const { servicesById, onServiceSelect } = props;

  React.useEffect(() => {
    pipe(
      serviceIdToLoad,
      O.fromNullable,
      O.chainNullableK(sid => servicesById[sid]),
      O.map(servicePot => {
        // if service has been loaded
        if (isStrictSome(servicePot)) {
          onServiceSelect(servicePot.value);
          setServiceIdToLoad(undefined);
          return;
        }
        if (pot.isError(servicePot)) {
          showToast(I18n.t("global.genericError"));
        }
      })
    );
  }, [servicesById, onServiceSelect, serviceIdToLoad]);

  const reloadWebView = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setWebViewError(false);
    }
  };

  /**
   * 'listen' on web message
   * if a serviceId is sent: dispatch service loading request
   * @param event
   */
  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    pipe(
      event.nativeEvent.data,
      ServiceId.decode,
      E.map(sId => {
        setServiceIdToLoad(sId);
        // request loading service
        props.loadService(sId);
      })
    );
  };

  const isLoadingServiceLoading = pipe(
    serviceIdToLoad,
    O.fromNullable,
    O.chainNullableK(sid => props.servicesById[sid]),
    O.fold(() => false, pot.isLoading)
  );
  return (
    <>
      {isLoadingServiceLoading && renderLoading()}

      <WebView
        androidCameraAccessDisabled={true}
        androidMicrophoneAccessDisabled={true}
        ref={webViewRef}
        injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
        style={styles.webView}
        textZoom={100}
        source={{
          uri: localServicesWebUrl
        }}
        onError={() => setWebViewError(true)}
        onMessage={handleWebviewMessage}
        startInLoadingState={true}
        renderLoading={renderLoading}
        javaScriptEnabled={true}
      />
      {webViewError && (
        <View style={styles.genericError}>
          <GenericErrorComponent onRetry={reloadWebView} />
        </View>
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId))
});

const mapStateToProps = (state: GlobalState) => ({
  servicesById: servicesByIdSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(LocalServicesWebView));
