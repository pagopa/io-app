import { useLinkTo } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { handleInternalLink } from "../../../utils/internalLink";
import { handleLinkMessage, isIoInternalLink } from "./handlers/link";
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

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const { shouldHandleLink = () => true } = props;
    props.setLoadingFalse();

    // We validate the format of the message with io-ts
    const messageOrErrors = WebViewMessage.decode(
      JSON.parse(event.nativeEvent.data)
    );

    pipe(
      messageOrErrors,
      E.map(message => {
        switch (message.type) {
          case "LINK_MESSAGE":
            if (!shouldHandleLink(message.payload.href)) {
              break;
            }
            if (isIoInternalLink(message.payload.href)) {
              handleInternalLink(linkTo, message.payload.href);
              break;
            }
            handleLinkMessage(message.payload.href);
            pipe(
              props.onLinkClicked,
              O.fromNullable,
              O.map(s => s(message.payload.href))
            );
            break;

          case "RESIZE_MESSAGE":
            props.setHtmlBodyHeight(message.payload.height);
            break;
        }
      })
    );
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
