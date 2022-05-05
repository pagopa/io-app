import { WebView } from "react-native-webview";
import React from "react";
import { useLinkTo } from "@react-navigation/native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { fromNullable } from "fp-ts/lib/Option";
import { StyleProp, ViewStyle } from "react-native";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { useIODispatch } from "../../../store/hooks";
import { convertUrlToNavigationLink, isCTAv2 } from "../../../utils/navigation";
import { handleLinkMessage } from "./handlers/link";
import { WebViewMessage } from "./types";

type Props = {
  injectedJavascript: string;
  handleLoadEnd: () => void;
  html: string;
  webviewKey: number;
  webViewRef: React.RefObject<WebView>;
  setLoadingFalse: () => void;
  setHtmlBodyHeight: (h: number) => void;
  shouldHandleLink?: (link: string) => boolean;
  onLinkClicked?: (url: string) => void;
  letUserZoom?: boolean;
  webViewStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const MarkdownWebviewComponent = (props: Props) => {
  const linkTo = useLinkTo();
  const dispatch = useIODispatch();

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const { shouldHandleLink = () => true } = props;
    props.setLoadingFalse();

    // We validate the format of the message with io-ts
    const messageOrErrors = WebViewMessage.decode(
      JSON.parse(event.nativeEvent.data)
    );

    messageOrErrors.map(message => {
      switch (message.type) {
        case "LINK_MESSAGE":
          if (!shouldHandleLink(message.payload.href)) {
            break;
          }
          if (isCTAv2(message.payload.href)) {
            const internalPath = convertUrlToNavigationLink(
              message.payload.href
            );
            linkTo(internalPath);
            break;
          }
          handleLinkMessage(dispatch, message.payload.href);
          fromNullable(props.onLinkClicked).map(s => s(message.payload.href));
          break;

        case "RESIZE_MESSAGE":
          props.setHtmlBodyHeight(message.payload.height);
          break;
      }
    });
  };

  return (
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      testID={props.testID}
      accessible={false}
      key={props.webviewKey}
      textZoom={100}
      ref={props.webViewRef}
      scrollEnabled={false}
      overScrollMode={"never"}
      style={props.webViewStyle}
      originWhitelist={["*"]}
      source={{ html: props.html, baseUrl: "" }}
      javaScriptEnabled={true}
      injectedJavaScript={closeInjectedScript(
        props.injectedJavascript + (props.letUserZoom ? "" : AVOID_ZOOM_JS)
      )}
      onLoadEnd={props.handleLoadEnd}
      onMessage={handleWebViewMessage}
      showsVerticalScrollIndicator={false}
    />
  );
};
export default MarkdownWebviewComponent;
