import CookieManager, { Cookie } from "@react-native-community/cookies";
import { Content } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import URLParse from "url-parse";
import { Route, useRoute } from "@react-navigation/native";
import I18n from "../../i18n";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  tokenFromNameSelector,
  TokenName
} from "../../store/reducers/authentication";
import { resetInternalRouteNavigation } from "../../store/actions/internalRouteNavigation";
import { serviceMetadataByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { useIOSelector } from "../../store/hooks";
import { ServiceId } from "../../../definitions/backend/ServiceId";

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
    if (token.isNone()) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        token.isNone()
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
          {!cookieError && isCookieAvailable && token.isSome() && (
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBackAndResetInternalNavigationInfo: () => {
    dispatch(resetInternalRouteNavigation());
    navigateBack();
  }
});

export default connect(undefined, mapDispatchToProps)(ServicesWebviewScreen);
