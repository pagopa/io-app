import { useLinkTo } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { LegacyRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";

import { handleInternalLink } from "../../../utils/internalLink";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../utils/webview";
import { handleLinkMessage, isIoInternalLink } from "./handlers/link";
import { WebViewMessage } from "./types";

type Props = {
  handleLoadEnd: () => void;
  html: string;
  injectedJavascript: string;
  letUserZoom?: boolean;
  onLinkClicked?: (url: string) => void;
  setHtmlBodyHeight: (h: number) => void;
  setLoadingFalse: () => void;
  shouldHandleLink?: (link: string) => boolean;
  testID?: string;
  webviewKey: number;
  webViewRef: LegacyRef<WebView>;
  webViewStyle?: StyleProp<ViewStyle>;
};

export const MarkdownWebviewComponent = (props: Props) => {
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
      accessible={false}
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      injectedJavaScript={closeInjectedScript(
        props.injectedJavascript + (props.letUserZoom ? "" : AVOID_ZOOM_JS)
      )}
      javaScriptEnabled={true}
      key={props.webviewKey}
      onLoadEnd={props.handleLoadEnd}
      onMessage={handleWebViewMessage}
      originWhitelist={["*"]}
      overScrollMode={"never"}
      ref={props.webViewRef}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      source={{ html: props.html, baseUrl: "" }}
      style={props.webViewStyle}
      testID={props.testID}
      textZoom={100}
    />
  );
};
