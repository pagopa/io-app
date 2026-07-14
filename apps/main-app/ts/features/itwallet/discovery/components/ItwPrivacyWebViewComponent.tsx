import { useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewMessageEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";

import {
  AVOID_ZOOM_JS,
  closeInjectedScript,
  GET_CONTENT_HEIGHT_SCRIPT
} from "../../../../utils/webview";

type Props = {
  onError: () => void;
  onLoadEnd: () => void;
  source: WebViewSource;
};

const ItwPrivacyWebViewComponent = ({ source, onLoadEnd, onError }: Props) => {
  const [contentHeight, setContentHeight] = useState<number>(0);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setContentHeight(height);
  };

  return (
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      injectedJavaScript={closeInjectedScript(
        `${AVOID_ZOOM_JS};${GET_CONTENT_HEIGHT_SCRIPT}`
      )}
      javaScriptEnabled={true}
      onError={onError}
      onLoadEnd={onLoadEnd}
      onMessage={handleWebViewMessage}
      scrollEnabled={false}
      source={source}
      style={{ height: contentHeight }}
      textZoom={100}
    />
  );
};

export default ItwPrivacyWebViewComponent;
