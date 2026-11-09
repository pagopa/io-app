import {
  IOColors,
  useIOFontDynamicScale,
  useIOTheme
} from "@io-app/design-system";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewMessageEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";

import { getPrivacyWebViewScripts } from "../utils/privacyWebViewScripts";

type Props = {
  onError: () => void;
  onLoadEnd: () => void;
  source: WebViewSource;
};

const ItwPrivacyWebViewComponent = ({ source, onLoadEnd, onError }: Props) => {
  const [contentHeight, setContentHeight] = useState<number>(0);
  const webViewRef = useRef<WebView>(null);
  const { dynamicFontScale } = useIOFontDynamicScale();
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];
  const textColor = IOColors[theme["textBody-default"]];
  const linkColor = IOColors[theme["interactiveElem-default"]];
  const textZoom = Math.round(dynamicFontScale * 100);
  const { styleScript, injectedJavaScript } = getPrivacyWebViewScripts({
    backgroundColor,
    linkColor,
    textColor,
    textSizeAdjust: Platform.OS === "ios" ? textZoom : 100
  });

  useEffect(() => {
    webViewRef.current?.injectJavaScript(styleScript);
  }, [styleScript]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setContentHeight(height);
  };

  return (
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled={true}
      onError={onError}
      onLoadEnd={onLoadEnd}
      onMessage={handleWebViewMessage}
      ref={webViewRef}
      scrollEnabled={false}
      source={source}
      style={{ backgroundColor, height: contentHeight }}
      textZoom={textZoom}
    />
  );
};

export default ItwPrivacyWebViewComponent;
