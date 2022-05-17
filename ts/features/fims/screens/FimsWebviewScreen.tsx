import * as React from "react";
import { useCallback, useMemo } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import URLParse from "url-parse";
import { fromNullable } from "fp-ts/lib/Option";
import { Route, useNavigation, useRoute } from "@react-navigation/native";
import FimsWebView from "../components/FimsWebView";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { sessionTokenSelector } from "../../../store/reducers/authentication";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import {
  ioClearCookie,
  IOCookie,
  setCookie
} from "../../../utils/cookieManager";

export type FimsWebviewScreenNavigationParams = Readonly<{
  url: string;
}>;

const FimsWebviewScreen = () => {
  const [isCookieAvailable, setIsCookieAvailable] = React.useState(false);
  const [cookieError, setCookieError] = React.useState(false);
  const navigation = useNavigation();
  const route =
    useRoute<Route<"FIMS_WEBVIEW", FimsWebviewScreenNavigationParams>>();
  const dispatch = useIODispatch();

  const maybeSessionToken = fromNullable(useIOSelector(sessionTokenSelector));

  const goBackAndResetInternalNavigationInfo = useCallback(() => {
    navigation.goBack();
  }, [navigation, dispatch]);

  const clearCookie = () => {
    ioClearCookie(() => setCookieError(true));
  };

  const handleGoBack = () => {
    goBackAndResetInternalNavigationInfo();
    clearCookie();
  };

  React.useEffect(() => {
    // if params can't be decoded or the service has not a valid token name in its metadata (token is none)
    // show an alert and go back
    if (!navigation.isFocused()) {
      return;
    }

    if (maybeSessionToken.isNone()) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        maybeSessionToken.isNone()
          ? I18n.t("webView.error.missingToken")
          : I18n.t("webView.error.missingParams"),
        [
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: goBackAndResetInternalNavigationInfo
          }
        ]
      );
      return;
    }
    const url = new URLParse(route.params.url as string, true);
    const cookie: IOCookie = {
      name: "token",
      value: maybeSessionToken.value,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      secure: true
    };

    setCookie(
      url.origin,
      cookie,
      () => setIsCookieAvailable(true),
      () => setCookieError(true)
    );

    return clearCookie;
  }, [goBackAndResetInternalNavigationInfo, maybeSessionToken, navigation]);

  const showWebview = useMemo(
    () => !cookieError && isCookieAvailable,
    [cookieError, isCookieAvailable]
  );
  return (
    <BaseScreenComponent goBack={handleGoBack}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          {showWebview && maybeSessionToken.isSome() && (
            <FimsWebView onWebviewClose={handleGoBack} uri={route.params.url} />
          )}
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default FimsWebviewScreen;
