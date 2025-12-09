import { createRef, useEffect, useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewSourceUri
} from "react-native-webview/lib/WebViewTypes";
import I18n from "i18next";
import { mixpanelTrack } from "../mixpanel";
import { resetDebugData, setDebugData } from "../store/actions/debug";
import { useIODispatch } from "../store/hooks";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "./screens/OperationResultScreenContent";

type Props = {
  source: WebViewSourceUri;
  playgroundEnabled?: boolean;
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
          enableAnimatedPictogram
          testID="webview-error"
          pictogram="umbrella"
          title={I18n.t("wallet.errors.GENERIC_ERROR")}
          isHeaderVisible
          subtitle={I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
          action={{
            label: I18n.t("global.buttons.retry"),
            onPress: handleReload
          }}
        />
      ) : (
        <LoadingSpinnerOverlay isLoading={loading}>
          <WebView
            testID="webview"
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={true}
            cacheEnabled={false}
            style={{ flex: 1 }}
            ref={ref}
            onLoadEnd={() => setLoading(false)}
            onHttpError={handleError}
            onError={handleError}
            source={source}
          />
        </LoadingSpinnerOverlay>
      )}
    </>
  );
};

export default WebviewComponent;
