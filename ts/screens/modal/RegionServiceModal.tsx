import CookieManager, { Cookie } from "@react-native-community/cookies";
import { Body, Container, Content, Left, Text, View } from "native-base";
import * as React from "react";
import { Alert, ScrollView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import I18n from "../../i18n";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { Monospace } from "../../components/core/typography/Monospace";
import ActivityIndicator from "../../components/ui/ActivityIndicator";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";
import { getLocalePrimaryWithFallback } from "../../utils/locale";
import { showToast } from "../../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../utils/webview";

type Props = {
  onModalClose: () => void;
};

const styles = StyleSheet.create({
  textInput: { padding: 1, borderWidth: 1, height: 30 },
  contentPadding: { paddingHorizontal: customVariables.contentPadding },
  webViewHeight: { height: heightPercentageToDP("50%") }
});

const RegionServiceModal: React.FunctionComponent<Props> = (props: Props) => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [webMessage, setWebMessage] = React.useState("");
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const cookie: Cookie = {
      name: "test",
      value: "test",
      domain: "192.168.1.20", // the domain on which you need to add the cookie, in this case the IP on your machine
      path: "/",
      version: "1",
      expires: "2021-05-30T12:30:00.00-05:00"
    };
    /**
     * the domain on which you need to add the cookie, in this case the IP on your machine
     * this value and domain value on cookie MUST match
     * this parameter is considered only by Android.
     */
    CookieManager.set("http://192.168.1.20", cookie).catch(_ =>
      showToast(
        `Unable to execute cookie authentication for ${cookie.name}`,
        "danger"
      )
    );

    if (navigationURI === "") {
      setNavigationUri("http://192.168.1.20:3000/test-html");
    }
  });

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
      <View spacer={true} />

      <Text alignCenter={true}>{`${I18n.t("global.genericThanks")},`}</Text>
      <Text alignCenter={true} bold={true}>
        {text}
      </Text>
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

      <Text alignCenter={true} bold={true}>
        {text}
      </Text>
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
      <View style={styles.contentPadding}>
        <TextInput
          style={styles.textInput}
          onChangeText={setNavigationUri}
          value={navigationURI}
        />
        <ScrollView>
          {!success && !error && (
            <View style={styles.webViewHeight}>
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
          <Monospace>{webMessage}</Monospace>
          {success && showSuccessContent()}
          {error && showErrorContent()}
        </ScrollView>
      </View>
    </Container>
  );
};

export default RegionServiceModal;
