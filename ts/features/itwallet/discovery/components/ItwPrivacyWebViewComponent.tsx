import React, { useState } from "react";
import { IOStyles } from "@pagopa/io-app-design-system";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { View } from "react-native";
import * as E from "fp-ts/lib/Either";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import {
  AVOID_ZOOM_JS,
  closeInjectedScript,
  ON_SCROLL_END_LISTENER
} from "../../../../utils/webview";
import { FooterActions } from "../../../../components/ui/FooterActions";
import I18n from "../../../../i18n";
import { WebViewMessage } from "../../../../components/ui/Markdown/types";

type Props = {
  source: WebViewSource;
  onAcceptTos: () => void;
  onLoadEnd: () => void;
  onError: () => void;
};

const ItwPrivacyWebViewComponent = ({
  source,
  onAcceptTos,
  onLoadEnd,
  onError
}: Props) => {
  const [disabled, setDisabled] = useState(true);

  // A function that handles messages sent by the WebView component
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    // We validate the format of the message with a dedicated codec
    const messageOrErrors = WebViewMessage.decode(
      JSON.parse(event.nativeEvent.data)
    );

    if (E.isLeft(messageOrErrors)) {
      // If the message is not valid we ignore it
      return;
    } else {
      // If the message is valid we extract the message
      const message = messageOrErrors.right;
      if (message.type === "SCROLL_END_MESSAGE") {
        setDisabled(false);
      }
    }
  };

  return (
    <View style={IOStyles.flex}>
      <WebView
        androidCameraAccessDisabled={true}
        androidMicrophoneAccessDisabled={true}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onMessage={handleWebViewMessage}
        textZoom={100}
        style={IOStyles.flex}
        source={source}
        injectedJavaScript={closeInjectedScript(
          AVOID_ZOOM_JS + ON_SCROLL_END_LISTENER
        )}
      />
      <FooterActions
        fixed={false}
        actions={{
          type: "SingleButton",
          primary: {
            disabled,
            label: I18n.t("features.itWallet.ipzsPrivacy.button.label"),
            accessibilityLabel: I18n.t(
              "features.itWallet.ipzsPrivacy.button.label"
            ),
            onPress: () => onAcceptTos()
          }
        }}
      />
    </View>
  );
};

export default ItwPrivacyWebViewComponent;
