import { Body, Container, Content, Left, View } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { getLocalePrimaryWithFallback } from "../utils/locale";
import {
  closeInjectedScript,
  AVOID_ZOOM_JS,
  APP_EVENT_HANDLER
} from "../utils/webview";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { Label } from "./core/typography/Label";
import { Monospace } from "./core/typography/Monospace";
import ActivityIndicator from "./ui/ActivityIndicator";
import AppHeader from "./ui/AppHeader";
import IconFont from "./ui/IconFont";
import Switch from "./ui/Switch";

type Props = {
  onModalClose: () => void;
};

const styles = StyleSheet.create({
  textInput: { padding: 1, borderWidth: 1, height: 30 },
  contentPadding: { paddingHorizontal: customVariables.contentPadding },
  center: { alignItems: "center" },
  webViewHeight: { height: heightPercentageToDP("100%") }
});

const RegionServiceWebViewPlayGround: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [webMessage, setWebMessage] = React.useState("");
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [showDebug, setShowDebug] = React.useState(false);

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
    setWebMessage(event.nativeEvent.data);

    const data = JSON.parse(event.nativeEvent.data);
    const locale = getLocalePrimaryWithFallback();

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
        setText(data.payload[locale]);
        return;
      case "SHOW_ERROR":
        setError(true);
        setText(data.payload[locale]);
        return;
      case "SHOW_ALERT":
        Alert.alert(
          data.payload[locale].title,
          data.payload[locale].description
        );
        return;
      default:
        return;
    }
  };

  return (
    <Container>
      <AppHeader>
        <Left>
          <ButtonDefaultOpacity onPress={props.onModalClose} transparent={true}>
            <IconFont name="io-back" />
          </ButtonDefaultOpacity>
        </Left>
        <Body />
      </AppHeader>
      <SafeAreaView style={{ flex: 1 }}>
        <Content contentContainerStyle={{ flex: 1 }}>
          <TextInput
            style={styles.textInput}
            onChangeText={setNavigationUri}
            value={navigationURI}
          />
          <View spacer={true} />
          <View
            style={{
              flexDirection: "row",
              alignContent: "space-between"
            }}
          >
            <Label color={"bluegrey"}>{"Mostra debug"}</Label>
            <View hspacer={true} />
            <Switch value={showDebug} onValueChange={setShowDebug} />
          </View>
          <View spacer={true} />
          {!success && !error && (
            <View style={{ flex: 1 }}>
              <WebView
                source={{ uri: navigationURI }}
                textZoom={100}
                injectedJavaScript={closeInjectedScript(
                  AVOID_ZOOM_JS + APP_EVENT_HANDLER
                )}
                onMessage={handleWebviewMessage}
                sharedCookiesEnabled={true}
              />
            </View>
          )}
          {loading && (
            <ActivityIndicator color={customVariables.brandDarkGray} />
          )}
          {success && showSuccessContent()}
          {error && showErrorContent()}
          {showDebug && (
            <View style={{ position: "absolute", bottom: 0, zIndex: 10 }}>
              <Monospace>{webMessage}</Monospace>
            </View>
          )}
        </Content>
      </SafeAreaView>
    </Container>
  );
};

export default RegionServiceWebViewPlayGround;
