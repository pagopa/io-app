import CookieManager, { Cookie } from "@react-native-community/cookies";
import { Content } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import URLParse from "url-parse";
import { fromEither, fromNullable } from "fp-ts/lib/Option";
import I18n from "../../i18n";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  tokenFromNameSelector,
  TokenName
} from "../../store/reducers/authentication";
import { internalRouteNavigationParamsSelector } from "../../store/reducers/internalRouteNavigation";
import { GlobalState } from "../../store/reducers/types";
import { ServicesWebviewParams } from "../../types/ServicesWebviewParams";
import { resetInternalRouteNavigation } from "../../store/actions/internalRouteNavigation";
import { serviceMetadataByIdSelector } from "../../store/reducers/entities/services/servicesById";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  flex: { flex: 1 }
});

const ServicesWebviewScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
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
    const { navigationParams, token } = props;
    // if params can't be decoded or the service has not a valid token name in its metadata (token is none)
    // show an alert and go back
    if (navigationParams.isLeft() || token.isNone()) {
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
    const url = new URLParse(navigationParams.value.url, true);
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
          {!cookieError &&
            isCookieAvailable &&
            props.navigationParams.isRight() && (
              <RegionServiceWebView
                uri={props.navigationParams.value.url}
                onWebviewClose={handleGoBack}
              />
            )}
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapStateToProps = (state: GlobalState) => {
  const maybeParams = ServicesWebviewParams.decode(
    internalRouteNavigationParamsSelector(state)
  );

  const token = fromEither(maybeParams)
    .chain(params =>
      fromNullable(serviceMetadataByIdSelector(params.serviceId)(state))
    )
    .mapNullable(m => m.token_name)
    .chain(t => tokenFromNameSelector(t as TokenName)(state));

  return {
    navigationParams: maybeParams,
    token
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBackAndResetInternalNavigationInfo: () => {
    dispatch(resetInternalRouteNavigation());
    dispatch(navigateBack());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesWebviewScreen);
