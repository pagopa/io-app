import { useState } from "react";
import WebView from "react-native-webview";
import {
  WebViewMessageEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import {
  AVOID_ZOOM_JS,
  GET_CONTENT_HEIGHT_SCRIPT,
  closeInjectedScript
} from "../../../../utils/webview";

type Props = {
  source: WebViewSource;
  onLoadEnd: () => void;
  onError: () => void;
};

const ItwPrivacyWebViewComponent = ({ source, onLoadEnd, onError }: Props) => {
  const [contentHeight, setContentHeight] = useState<number>(0);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setContentHeight(height);
  };

  return (
    <WebView
      javaScriptEnabled={true}
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      onLoadEnd={onLoadEnd}
      onError={onError}
      textZoom={100}
      style={{ height: contentHeight }}
      source={source}
      scrollEnabled={false}
      onMessage={handleWebViewMessage}
      injectedJavaScript={closeInjectedScript(
        `${AVOID_ZOOM_JS};${GET_CONTENT_HEIGHT_SCRIPT}`
      )}
    />
  );
};

export default ItwPrivacyWebViewComponent;
