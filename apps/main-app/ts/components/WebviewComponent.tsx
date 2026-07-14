import I18n from "i18next";
import { createRef, useEffect, useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewSourceUri
} from "react-native-webview/lib/WebViewTypes";

import { mixpanelTrack } from "../mixpanel";
import { resetDebugData, setDebugData } from "../store/actions/debug";
import { useIODispatch } from "../store/hooks";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "./screens/OperationResultScreenContent";

type Props = {
  playgroundEnabled?: boolean;
  source: WebViewSourceUri;
};

const WebviewComponent = ({ source, playgroundEnabled }: Props) => {
  const dispatch = useIODispatch();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const ref = createRef<WebView>();

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    if (ref.current) {
      ref.current.reload();
      ref.current.clearCache?.(true);
    }
  };

  useEffect(
    () => () => {
      dispatch(resetDebugData(["cgnError"]));
    },
    [dispatch]
  );

  useEffect(() => {
    setHasError(false);
  }, [source]);

  const handleError = (event: WebViewErrorEvent | WebViewHttpErrorEvent) => {
    void mixpanelTrack("CGN_LANDING_PAGE_LOAD_ERROR", {
      uri: source.uri,
      description: event.nativeEvent?.description
    });
    setHasError(true);
    dispatch(
      setDebugData({
        cgnError: {
          technicalLog: event.nativeEvent,
          uri: source.uri,
          headers: source.headers
        }
      })
    );
  };

  return (
    <>
      {hasError && !playgroundEnabled ? (
        <OperationResultScreenContent
          action={{
            label: I18n.t("global.buttons.retry"),
            onPress: handleReload
          }}
          isHeaderVisible
          pictogram="umbrella"
          subtitle={I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
          testID="webview-error"
          title={I18n.t("wallet.errors.GENERIC_ERROR")}
        />
      ) : (
        <LoadingSpinnerOverlay isLoading={loading}>
          <WebView
            allowsInlineMediaPlayback={true}
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            cacheEnabled={false}
            mediaPlaybackRequiresUserAction={true}
            onError={handleError}
            onHttpError={handleError}
            onLoadEnd={() => setLoading(false)}
            ref={ref}
            source={source}
            style={{ flex: 1 }}
            testID="webview"
          />
        </LoadingSpinnerOverlay>
      )}
    </>
  );
};

export default WebviewComponent;
