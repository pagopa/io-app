import * as React from "react";
import WebView from "react-native-webview";
import { useState } from "react";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import GenericErrorComponent from "./screens/GenericErrorComponent";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  source: WebViewSource;
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

  return (
    <>
      {hasError ? (
        <GenericErrorComponent onRetry={handleReload} />
      ) : (
        <LoadingSpinnerOverlay isLoading={loading}>
          <WebView
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            style={IOStyles.flex}
            ref={ref}
            onLoadEnd={() => setLoading(false)}
            onError={() => setHasError(true)}
            source={props.source}
          />
        </LoadingSpinnerOverlay>
      )}
    </>
  );
};

export default WebviewComponent;
