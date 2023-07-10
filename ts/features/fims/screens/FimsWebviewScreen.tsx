import { Route, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { Alert, SafeAreaView, View } from "react-native";
import URLParse from "url-parse";
import { Cookie } from "@react-native-cookies/cookies";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { fimsTokenSelector } from "../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import { clearCookie, setCookie } from "../../../utils/cookieManager";
import FimsWebView from "../components/FimsWebView";
import { isLocalEnv } from "../../../utils/environment";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";

export type FimsWebviewScreenNavigationParams = Readonly<{
  url: string;
}>;

const fimsCookieName = "X-IO-FIMS-Token";

const FimsWebviewScreen = () => {
  const [title, setTitle] = React.useState<string>();
  const [isCookieAvailable, setIsCookieAvailable] = React.useState(false);
  const [cookieError, setCookieError] = React.useState(false);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const route =
    useRoute<Route<"FIMS_WEBVIEW", FimsWebviewScreenNavigationParams>>();

  const fimsTokenOpt = useIOSelector(fimsTokenSelector);
  const fimsDomainOpt = useIOSelector(fimsDomainSelector);
  const parsedUrlOpt = React.useMemo(() => {
    if (!fimsDomainOpt) {
      return undefined;
    }
    const parsedUrl = new URLParse(fimsDomainOpt, true);
    return parsedUrl.protocol && (isLocalEnv || parsedUrl.protocol === "https:")
      ? parsedUrl
      : undefined;
  }, [fimsDomainOpt]);

  const goBackAndResetInternalNavigationInfo = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const clearCookieCallback = React.useCallback(() => {
    if (parsedUrlOpt) {
      clearCookie(parsedUrlOpt.hostname, fimsCookieName, () =>
        setCookieError(true)
      );
    }
  }, [parsedUrlOpt]);

  const handleGoBack = () => {
    goBackAndResetInternalNavigationInfo();
    clearCookieCallback();
  };

  React.useEffect(() => {
    // if params can't be decoded or the service has not a valid token name in its metadata (token is none)
    // show an alert and go back
    if (!navigation.isFocused()) {
      return;
    }

    if (!fimsTokenOpt) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        I18n.t("webView.error.missingToken"),
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

    if (!fimsDomainOpt || !parsedUrlOpt) {
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
      name: fimsCookieName,
      value: fimsTokenOpt,
      domain: parsedUrlOpt.hostname,
      secure: !isLocalEnv,
      httpOnly: !isLocalEnv
    };

    setCookie(
      parsedUrlOpt.origin,
      cookie,
      () => setIsCookieAvailable(true),
      () => setCookieError(true)
    );

    return clearCookieCallback;
  }, [
    clearCookieCallback,
    fimsDomainOpt,
    fimsTokenOpt,
    goBackAndResetInternalNavigationInfo,
    navigation,
    parsedUrlOpt
  ]);

  const showWebview = React.useMemo(
    () => !cookieError && isCookieAvailable,
    [cookieError, isCookieAvailable]
  );

  return (
    <BaseScreenComponent
      headerTitle={title}
      customGoBack={<View />}
      customRightIcon={{
        iconName: "closeMedium",
        onPress: handleGoBack,
        accessibilityLabel: I18n.t("global.buttons.close")
      }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.flex}>
          {showWebview && fimsTokenOpt && (
            <FimsWebView
              onTitle={setTitle}
              onWebviewClose={handleGoBack}
              uri={route.params.url}
              fimsDomain={fimsDomainOpt}
            />
          )}
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default FimsWebviewScreen;
