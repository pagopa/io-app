import { createRef, useEffect, useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewSourceUri
} from "react-native-webview/lib/WebViewTypes";
import { mixpanelTrack } from "../mixpanel";
import I18n from "../i18n";
import { useIODispatch } from "../store/hooks";
import { resetDebugData, setDebugData } from "../store/actions/debug";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { IOStyles } from "./core/variables/IOStyles";
import { OperationResultScreenContent } from "./screens/OperationResultScreenContent";

type Props = {
  source: WebViewSourceUri;
};

const WebviewComponent = ({ source }: Props) => {
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
      {hasError ? (
        <OperationResultScreenContent
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
            style={IOStyles.flex}
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
