import CookieManager, { Cookie } from "@react-native-community/cookies";
import * as pot from "italia-ts-commons/lib/pot";
import { Content } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import URLParse from "url-parse";
import I18n from "../../i18n";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  tokenFromNameSelector,
  TokenName
} from "../../store/reducers/authentication";
import { servicesMetadataByIdSelector } from "../../store/reducers/content";
import { internalRouteNavigationParamsSelector } from "../../store/reducers/internalRouteNavigation";
import { GlobalState } from "../../store/reducers/types";
import { ServicesWebviewParams } from "../../types/ServicesWebviewParams";

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
    props.goBack();
  };

  const clearCookie = () => {
    CookieManager.clearAll().catch(_ => setCookieError(true));
  };

  React.useEffect(() => {
    const { navigationParams, token } = props;
    if (navigationParams.isLeft()) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        I18n.t("webView.error.missingParams"),
        [
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: props.goBack
          }
        ]
      );
      return;
    }
    if (!token || token.isNone()) {
      Alert.alert(
        I18n.t("global.genericAlert"),
        I18n.t("webView.error.missingToken"),
        [
          {
            text: I18n.t("global.buttons.exit"),
            style: "default",
            onPress: props.goBack
          }
        ]
      );
      return;
    }
    if (token && token.isSome() && navigationParams.isRight()) {
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
    }

    return clearCookie;
  });

  return (
    <BaseScreenComponent goBack={handleGoBack}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          {!cookieError &&
            isCookieAvailable &&
            props.navigationParams.isRight() && (
              <RegionServiceWebView
                uri={props.navigationParams.value.url}
                onModalClose={handleGoBack}
              />
            )}
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapStateToProps = (state: GlobalState) => {
  const params = ServicesWebviewParams.decode(
    internalRouteNavigationParamsSelector(state)
  );

  // Get TokenName parameter from service metadata
  const servicesMetadataByID = servicesMetadataByIdSelector(state);

  const tokenName = () => {
    if (params.isRight()) {
      const metadata = servicesMetadataByID[params.value.serviceID];
      if (pot.isSome(metadata)) {
        return metadata.value && metadata.value.token_name;
      }
    }
    return undefined;
  };

  return {
    navigationParams: params,
    token: tokenName() && tokenFromNameSelector(tokenName() as TokenName)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesWebviewScreen);
