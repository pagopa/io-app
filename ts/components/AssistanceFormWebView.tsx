import { StyleSheet, View } from "react-native";
import React, { createRef, FC, useState } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { fromNullable } from "fp-ts/lib/Option";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../utils/webview";
import { loadServiceDetail } from "../store/actions/services";
import { GlobalState } from "../store/reducers/types";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { servicesByIdSelector } from "../store/reducers/entities/services/servicesById";
import { RefreshIndicator } from "./ui/RefreshIndicator";
import GenericErrorComponent from "./screens/GenericErrorComponent";
import { withLightModalContext } from "./helpers/withLightModalContext";

const URI = "http://localhost:5000/";

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
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
  }
});

type Props = {
  onServiceSelect: (service: ServicePublic) => void;
} & ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This component is basically a webview that loads an url showing local services
 * It intercepts the request of loading a service and it does:
 * - block that request from loading
 * - extract from the request url the service id
 * - load the selected service starting from the service id (load and error are handled)
 */
const AssistanceForm: FC<Props> = ({ loadService, servicesById }) => {
  const [serviceIdToLoad, setServiceIdToLoad] = useState<string | undefined>(
    undefined
  );
  const [webViewError, setWebViewError] = useState(false);
  const webViewRef = createRef<WebView>();

  const renderLoading = () => (
    <View style={styles.refreshIndicatorContainer}>
      <RefreshIndicator />
    </View>
  );

  const reloadWebView = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setWebViewError(false);
    }
  };

  const onError = () => setWebViewError(true);

  /**
   * 'listen' on web message
   * if a serviceId is sent: dispatch service loading request
   * @param event
   */
  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    ServiceId.decode(event.nativeEvent.data).map(sId => {
      setServiceIdToLoad(sId);
      // request loading service
      loadService(sId);
    });
  };

  const isLoadingService = fromNullable(serviceIdToLoad)
    .mapNullable(sid => servicesById[sid])
    .fold(false, pot.isLoading);

  return (
    <>
      {isLoadingService && renderLoading()}
      <WebView
        ref={webViewRef}
        injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
        style={{ flex: 1 }}
        textZoom={100}
        source={{ uri: URI }}
        onError={onError}
        onMessage={handleWebviewMessage}
        renderLoading={renderLoading}
        startInLoadingState
        javaScriptEnabled
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
)(withLightModalContext(AssistanceForm));
