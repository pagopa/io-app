import { Content, View } from "native-base";
import URLParse from "url-parse";
import * as React from "react";
import { useCallback } from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import CookieManager from "@react-native-community/cookies";
import { fromNullable } from "fp-ts/lib/Option";
import FimsWebView from "../components/FimsWebView";
import { resetInternalRouteNavigation } from "../../../store/actions/internalRouteNavigation";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { showToast } from "../../../utils/showToast";
import { IOCookie, setCookie } from "../../../utils/cookieManager";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import IconFont from "../../../components/ui/IconFont";
import customVariables from "../../../theme/variables";
import { Label } from "../../../components/core/typography/Label";

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: { flex: 1, padding: 1, borderWidth: 1, height: 30 },
  center: { alignItems: "center" },
  contentCenter: { justifyContent: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  debugArea: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    height: heightPercentageToDP("15%")
  }
});

const FimsPlayground = () => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  const navigation = useNavigationContext();

  const dispatch = useIODispatch();

  const maybeSessionToken = fromNullable(useIOSelector(sessionTokenSelector));
  const maybeFimsDomain = fromNullable(useIOSelector(fimsDomainSelector));

  const clearCookies = () => {
    CookieManager.clearAll(true)
      .then(() => showToast("Cookies cleared", "success"))
      .catch(_ => showToast("Unable to remove Cookies"));
  };

  const handleUriInput = (text: string) => {
    setNavigationUri(text.toLowerCase());
  };

  const goBackAndResetInternalNavigationInfo = useCallback(() => {
    navigation.goBack(null);
    dispatch(resetInternalRouteNavigation());
  }, [navigation, dispatch]);

  const handleGoBack = () => {
    goBackAndResetInternalNavigationInfo();
    clearCookies();
  };

  React.useEffect(() => {
    if (maybeSessionToken.isNone()) {
      return;
    }

    if (maybeFimsDomain.isNone()) {
      return;
    }
    const url = new URLParse(maybeFimsDomain.value as string, true);
    const cookie: IOCookie = {
      name: "token",
      value: maybeSessionToken.value,
      domain: url.hostname,
      path: "/"
    };

    setCookie(
      url.origin,
      cookie,
      () => {
        showToast("cookie salvato con successo", "success");
      },
      () => {
        showToast("cookie non salvato", "danger");
      }
    );
  }, [maybeSessionToken, maybeFimsDomain]);

  return (
    <BaseScreenComponent goBack={handleGoBack}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              onChangeText={handleUriInput}
              value={navigationURI}
            />
            <View hspacer={true} />
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => setLoadUri(navigationURI)}
            >
              <IconFont
                name={"io-right"}
                style={{
                  color: customVariables.colorWhite
                }}
              />
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <View style={styles.row}>
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => setReloadKey(r => r + 1)}
            >
              <Label color={"white"}>Reload</Label>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={clearCookies}
            >
              <Label color={"white"}>Clear cookies</Label>
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <View style={{ flex: 1 }}>
            <FimsWebView
              key={`${reloadKey}_webview`}
              uri={loadUri}
              onWebviewClose={handleGoBack}
            />
          </View>
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default FimsPlayground;
