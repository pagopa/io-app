import { Content, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { WebviewMessage } from "../types/WebviewMessage";
import { getLocalePrimaryWithFallback } from "../utils/locale";
import { showToast } from "../utils/showToast";
import {
  closeInjectedScript,
  AVOID_ZOOM_JS,
  APP_EVENT_HANDLER
} from "../utils/webview";
import { Label } from "./core/typography/Label";
import ActivityIndicator from "./ui/ActivityIndicator";
import IconFont from "./ui/IconFont";

type Props = {
  onModalClose: () => void;
  uri: string;
  handleWebMessage?: (message: string) => void;
};

const styles = StyleSheet.create({
  textInput: { padding: 1, borderWidth: 1, height: 30 },
  contentPadding: { paddingHorizontal: customVariables.contentPadding },
  center: { alignItems: "center" },
  webViewHeight: { height: heightPercentageToDP("100%") }
});

const RegionServiceWebView: React.FunctionComponent<Props> = (props: Props) => {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const showSuccessContent = () => (
    <Content>
      <IconFont
        name={"io-close"}
        style={{
          alignSelf: "flex-end"
        }}
        onPress={() => setSuccess(false)}
      />
      <IconFont
        name={"io-complete"}
        size={120}
        color={customVariables.brandHighlight}
        style={{
          alignSelf: "center"
        }}
      />
      <View spacer={true} large={true} />

      <View style={styles.center}>
        <Label>{`${I18n.t("global.genericThanks")},`}</Label>
        <Label weight={"Bold"}>{text}</Label>
      </View>
    </Content>
  );

  const showErrorContent = () => (
    <Content>
      <IconFont
        name={"io-close"}
        style={{
          alignSelf: "flex-end"
        }}
        onPress={() => setError(false)}
      />
      <IconFont
        name={"io-error"}
        size={120}
        color={customVariables.brandDanger}
        style={{
          alignSelf: "center"
        }}
      />
      <View spacer={true} />

      <View style={styles.center}>
        <Label weight={"Bold"}>{text}</Label>
      </View>
    </Content>
  );

  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    if (props.handleWebMessage) {
      props.handleWebMessage(event.nativeEvent.data);
    }

    const data = JSON.parse(event.nativeEvent.data);
    const locale = getLocalePrimaryWithFallback();

    if (WebviewMessage.decode(event.nativeEvent.data).isLeft()) {
      showToast(I18n.t("webView.error.convertMessage"));
      return;
    }

    switch (data.type) {
      case "CLOSE_MODAL":
        props.onModalClose();
        return;
      case "START_LOAD":
        setLoading(true);
        return;
      case "END_LOAD":
        setLoading(false);
        return;
      case "SHOW_SUCCESS":
        setSuccess(true);
        setText(data[locale]);
        return;
      case "SHOW_ERROR":
        setError(true);
        setText(data[locale]);
        return;
      case "SHOW_ALERT":
        Alert.alert(data[locale].title, data[locale].description);
        return;
      default:
        return;
    }
  };

  return (
    <>
      {!success && !error && (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: props.uri }}
            textZoom={100}
            injectedJavaScript={closeInjectedScript(
              AVOID_ZOOM_JS + APP_EVENT_HANDLER
            )}
            onMessage={handleWebviewMessage}
            sharedCookiesEnabled={true}
          />
        </View>
      )}
      {loading && <ActivityIndicator color={customVariables.brandDarkGray} />}
      {success && showSuccessContent()}
      {error && showErrorContent()}
    </>
  );
};

export default RegionServiceWebView;
