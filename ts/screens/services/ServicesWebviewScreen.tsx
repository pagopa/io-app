import CookieManager, { Cookie } from "@react-native-community/cookies";
import { fromNullable } from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import URLParse from "url-parse";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { tokenFromSessionInfoSelector } from "../../store/reducers/authentication";
import { internalRouteNavigationParamsSelector } from "../../store/reducers/internalRouteNavigation";
import { GlobalState } from "../../store/reducers/types";

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

  const onDidFocus = () => {
    if (props.token.isSome() && props.url) {
      const url = new URLParse(props.url, true);
      const cookie: Cookie = {
        name: "token",
        value: props.token.value,
        domain: url.hostname,
        path: "/"
      };

      CookieManager.set(url.origin, cookie, true)
        .then(_ => {
          setIsCookieAvailable(true);
        })
        .catch(_ => setCookieError(true));
    }
  };

  const onDidBlur = () => {
    CookieManager.clearAll().catch(_ => setCookieError(true));
  };

  return (
    <BaseScreenComponent goBack={true}>
      <NavigationEvents onDidBlur={onDidBlur} onDidFocus={onDidFocus} />
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          {!cookieError && isCookieAvailable && (
            <RegionServiceWebView
              uri={fromNullable(props.url).getOrElse("")}
              onModalClose={props.goBack}
            />
          )}
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapStateToProps = (state: GlobalState) => {
  const maybeParams = fromNullable(
    internalRouteNavigationParamsSelector(state)
  );

  // TODO Add TokenName parameter from service metadata

  return {
    url: maybeParams.fold("", p => p.url),
    token: tokenFromSessionInfoSelector(state, "walletToken")
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesWebviewScreen);
