import CookieManager, { Cookie } from "@react-native-community/cookies";
import { Body, Container, Left, View } from "native-base";
import * as React from "react";
import { Alert, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { Monospace } from "../../components/core/typography/Monospace";
import ActivityIndicator from "../../components/ui/ActivityIndicator";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";
import { getCurrentLocale } from "../../utils/locale";
import { showToast } from "../../utils/showToast";
import {
  APP_EVENT_HANDLER,
  AVOID_ZOOM_JS,
  closeInjectedScript
} from "../../utils/webview";

type Props = {
  onModalClose: () => void;
};

const RegionServiceModal: React.FunctionComponent<Props> = (props: Props) => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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

  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    setMessage(event.nativeEvent.data);

    const data = JSON.parse(event.nativeEvent.data);
    const locale = getCurrentLocale();

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
        showToast(data.payload[locale], "success");
        return;
      case "SHOW_ERROR":
        showToast(data.payload[locale], "danger");
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
          <ButtonDefaultOpacity
            onPress={() => props.onModalClose()}
            transparent={true}
          >
            <IconFont name="io-back" />
          </ButtonDefaultOpacity>
        </Left>
        <Body />
      </AppHeader>
      <View style={{ paddingHorizontal: customVariables.contentPadding }}>
        <TextInput
          style={{ padding: 1, borderWidth: 1, height: 30 }}
          onChangeText={t => setNavigationUri(t)}
          value={navigationURI}
        />
        <View style={{ height: heightPercentageToDP("50%") }}>
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
        {loading && <ActivityIndicator color={customVariables.brandDarkGray} />}
        <Monospace>{message}</Monospace>
      </View>
    </Container>
  );
};

export default RegionServiceModal;
