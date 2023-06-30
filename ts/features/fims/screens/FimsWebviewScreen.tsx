import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { Alert, SafeAreaView, View } from "react-native";
import URLParse from "url-parse";
import { Cookie } from "@react-native-cookies/cookies";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { ioClearCookie, setCookie } from "../../../utils/cookieManager";
import FimsWebView from "../components/FimsWebView";
import { isLocalEnv } from "../../../utils/environment";

export type FimsWebviewScreenNavigationParams = Readonly<{
  url: string;
}>;

const FimsWebviewScreen = () => {
  const [isCookieAvailable, setIsCookieAvailable] = React.useState(false);
  const [cookieError, setCookieError] = React.useState(false);
  const navigation = useNavigation();
  const route =
    useRoute<Route<"FIMS_WEBVIEW", FimsWebviewScreenNavigationParams>>();

  const maybeFIMSToken = O.fromNullable(useIOSelector(fimsTokenSelector));
  const maybeFimsDomain = O.fromNullable(useIOSelector(fimsDomainSelector));

  const goBackAndResetInternalNavigationInfo = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

    if (O.isNone(maybeFIMSToken)) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        O.isNone(maybeFIMSToken)
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

    const maybeParsedUrl = pipe(
      maybeFimsDomain,
      O.chain(domain => {
        const parsed = new URLParse(domain as string, true);
        return parsed.protocol && (isLocalEnv || parsed.protocol === "https:")
          ? O.some(parsed)
          : O.none;
      })
    );

    if (O.isNone(maybeFimsDomain) || O.isNone(maybeParsedUrl)) {
      Alert.alert(I18n.t("global.genericAlert"), "", [
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: goBackAndResetInternalNavigationInfo
        }
      ]);
      return;
    }

    const cookie: Cookie = {
      name: "X-IO-FIMS-Token",
      value: maybeFIMSToken.value,
      domain: maybeParsedUrl.value.hostname,
      secure: !isLocalEnv,
      httpOnly: !isLocalEnv
    };

    setCookie(
      maybeParsedUrl.value.origin,
      cookie,
      () => setIsCookieAvailable(true),
      () => setCookieError(true)
    );

    return clearCookie;
  }, [
    goBackAndResetInternalNavigationInfo,
    maybeFIMSToken,
    maybeFimsDomain,
    navigation
  ]);

  const showWebview = useMemo(
    () => !cookieError && isCookieAvailable,
    [cookieError, isCookieAvailable]
  );
  return (
    <BaseScreenComponent goBack={handleGoBack}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          {showWebview && O.isSome(maybeFIMSToken) && (
            <FimsWebView
              onWebviewClose={handleGoBack}
              uri={route.params.url}
              fimsDomain={O.toUndefined(maybeFimsDomain)}
            />
          )}
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default FimsWebviewScreen;
