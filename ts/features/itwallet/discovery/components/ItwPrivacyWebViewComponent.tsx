import { FooterActions, IOStyles } from "@pagopa/io-app-design-system";
import WebView from "react-native-webview";
import { View } from "react-native";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../../utils/webview";
import I18n from "../../../../i18n";

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
}: Props) => (
  <View style={IOStyles.flex}>
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      onLoadEnd={onLoadEnd}
      onError={onError}
      textZoom={100}
      style={IOStyles.flex}
      source={source}
      injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
    />
    <FooterActions
      fixed={false}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("features.itWallet.ipzsPrivacy.button.label"),
          accessibilityLabel: I18n.t(
            "features.itWallet.ipzsPrivacy.button.label"
          ),
          onPress: onAcceptTos
        }
      }}
    />
  </View>
);

export default ItwPrivacyWebViewComponent;
