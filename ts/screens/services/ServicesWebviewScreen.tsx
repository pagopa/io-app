import CookieManager, { Cookie } from "@react-native-cookies/cookies";
import { Route, useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import URLParse from "url-parse";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { useIOSelector } from "../../store/hooks";
import {
  tokenFromNameSelector,
  TokenName
} from "../../store/reducers/authentication";
import { serviceMetadataByIdSelector } from "../../store/reducers/entities/services/servicesById";

export type ServiceWebviewScreenNavigationParams = Readonly<{
  serviceId: ServiceId;
  url: string;
}>;

type Props = ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  flex: { flex: 1 }
});

const ServicesWebviewScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const route =
    useRoute<
      Route<"SERVICES_NAVIGATOR", ServiceWebviewScreenNavigationParams>
    >();
  const maybeService = useIOSelector(
    serviceMetadataByIdSelector(route.params.serviceId)
  );
  const token = useIOSelector(
    tokenFromNameSelector(maybeService?.token_name as TokenName)
  );

  const [isCookieAvailable, setIsCookieAvailable] = React.useState(false);
  const [cookieError, setCookieError] = React.useState(false);

  const handleGoBack = () => {
    clearCookie();
    props.goBackAndResetInternalNavigationInfo();
  };

  const clearCookie = () => {
    CookieManager.clearAll().catch(_ => setCookieError(true));
  };

  // TODO: rewrite this hook following all the hooks rules
  React.useEffect(() => {
    // if params can't be decoded or the service has not a valid token name in its metadata (token is none)
    // show an alert and go back
    if (O.isNone(token)) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        O.isNone(token)
          ? I18n.t("webView.error.missingToken")
          : I18n.t("webView.error.missingParams"),
        [
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: props.goBackAndResetInternalNavigationInfo
          }
        ]
      );
      return;
    }
    const url = new URLParse(route.params.url, true);
    const cookie: Cookie = {
      name: "token",
      value: token.value,
      domain: url.hostname,
      path: "/"
    };

    CookieManager.set(url.origin, cookie, true)
      .then(_ => {
        setIsCookieAvailable(true);
      })
      .catch(_ => setCookieError(true));

    return clearCookie;
  }, []);

  return (
    <BaseScreenComponent goBack={handleGoBack}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          {!cookieError && isCookieAvailable && O.isSome(token) && (
            <RegionServiceWebView
              uri={route.params.url}
              onWebviewClose={handleGoBack}
            />
          )}
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  goBackAndResetInternalNavigationInfo: () => {
    navigateBack();
  }
});

export default connect(undefined, mapDispatchToProps)(ServicesWebviewScreen);
