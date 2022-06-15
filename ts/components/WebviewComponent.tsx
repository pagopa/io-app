import * as React from "react";
import { useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewSourceUri
} from "react-native-webview/lib/WebViewTypes";
import { mixpanelTrack } from "../mixpanel";
import GenericErrorComponent from "./screens/GenericErrorComponent";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  source: WebViewSourceUri;
};

const WebviewComponent = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const ref = React.createRef<WebView>();

  const handleReload = () => {
    setHasError(false);
    setLoading(true);
    if (ref.current) {
      ref.current.reload();
    }
  };

  const handleError = (event: WebViewErrorEvent | WebViewHttpErrorEvent) => {
    void mixpanelTrack("CGN_LANDING_PAGE_LOAD_ERROR", {
      uri: props.source.uri,
      ...event
    });
    setHasError(true);
  };

  return (
    <>
      {hasError ? (
        <GenericErrorComponent onRetry={handleReload} />
      ) : (
        <LoadingSpinnerOverlay isLoading={loading}>
          <WebView
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={true}
            style={IOStyles.flex}
            ref={ref}
            onLoadEnd={() => setLoading(false)}
            onHttpError={handleError}
            onError={handleError}
            source={props.source}
          />
        </LoadingSpinnerOverlay>
      )}
    </>
  );
};

export default WebviewComponent;
