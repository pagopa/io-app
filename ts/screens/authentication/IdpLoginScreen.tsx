import { fromNullable, none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { Image, NavState, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import EmailCallCTA from "../../components/screens/EmailCallCTA";
import BlockButtons from "../../components/ui/BlockButtons";
import Markdown from "../../components/ui/Markdown";
import { RefreshIndicator } from "../../components/ui/RefreshIndicator";
import I18n from "../../i18n";
import { idpLoginUrlChanged } from "../../store/actions/authentication";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";
import {
  isLoggedIn,
  isLoggedOutWithIdp,
  selectedIdentityProviderSelector
} from "../../store/reducers/authentication";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import { GlobalState } from "../../store/reducers/types";
import { SessionToken } from "../../types/SessionToken";
import { getIdpLoginUri, onLoginUriChanged } from "../../utils/login";
import { handleItemOnPress } from "../../utils/url";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

type State = {
  requestState: pot.Pot<true, ErrorType>;
  errorCode?: string;
  loginTrace?: string;
};

const brokenLinkImage = require("../../../img/broken-link.png");

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 10
  },
  errorBody: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center"
  },
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  },
  flex2: {
    flex: 2
  }
});

/**
 * A screen that allows the user to login with an IDP.
 * The IDP page is opened in a WebView
 */
class IdpLoginScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      requestState: pot.noneLoading
    };
  }

  private updateLoginTrace = (url: string): void => {
    this.setState({ loginTrace: url });
  };

  private handleLoadingError = (): void => {
    this.setState({
      requestState: pot.noneError(ErrorType.LOADING_ERROR)
    });
  };

  private handleLoginFailure = (errorCode?: string) => {
    this.props.dispatchLoginFailure(
      new Error(`login failure with code ${errorCode || "n/a"}`)
    );
    this.setState({
      requestState: pot.noneError(ErrorType.LOGIN_ERROR),
      errorCode
    });
  };

  private setRequestStateToLoading = (): void =>
    this.setState({ requestState: pot.noneLoading });

  private handleNavigationStateChange = (event: NavState): void => {
    if (event.url) {
      const urlChanged = event.url.split("?")[0];
      if (urlChanged !== this.state.loginTrace) {
        this.props.dispatchIdpLoginUrlChanged(urlChanged);
        this.updateLoginTrace(urlChanged);
      }
    }
    const isAssertion = fromNullable(event.url).fold(
      false,
      s => s.indexOf("/assertionConsumerService") > -1
    );
    this.setState({
      requestState:
        event.loading || isAssertion ? pot.noneLoading : pot.some(true)
    });
  };

  private handleShouldStartLoading = (event: NavState): boolean => {
    const isLoginUrlWithToken = onLoginUriChanged(
      this.handleLoginFailure,
      this.props.dispatchLoginSuccess
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  private renderMask = () => {
    if (pot.isLoading(this.state.requestState)) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <RefreshIndicator />
        </View>
      );
    } else if (pot.isError(this.state.requestState)) {
      const errorType = this.state.requestState.error;
      const errorTranslationKey = `authentication.errors.spid.error_${
        this.state.errorCode
      }`;

      return (
        <View style={styles.errorContainer}>
          <Image source={brokenLinkImage} resizeMode="contain" />
          <Text style={styles.errorTitle} bold={true}>
            {I18n.t(
              errorType === ErrorType.LOADING_ERROR
                ? "authentication.errors.network.title"
                : "authentication.errors.login.title"
            )}
          </Text>

          {errorType === ErrorType.LOGIN_ERROR && (
            <Text style={styles.errorBody}>
              {I18n.t(errorTranslationKey, {
                defaultValue: I18n.t("authentication.errors.spid.unknown")
              })}
            </Text>
          )}

          <View style={styles.errorButtonsContainer}>
            <ButtonDefaultOpacity
              onPress={this.props.navigation.goBack}
              style={styles.cancelButtonStyle}
              block={true}
              light={true}
              bordered={true}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              onPress={this.setRequestStateToLoading}
              style={styles.flex2}
              block={true}
              primary={true}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </ButtonDefaultOpacity>
          </View>
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  get contextualHelp() {
    const { selectedIdpTextData } = this.props;

    if (selectedIdpTextData.isNone()) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: () => (
          <Markdown>
            {I18n.t("authentication.idp_login.contextualHelpContent")}
          </Markdown>
        )
      };
    }
    const idpTextData = selectedIdpTextData.value;
    return {
      title: I18n.t("authentication.idp_login.contextualHelpTitle2"),
      body: () => (
        <React.Fragment>
          {/** Recover credentials */}
          <Markdown>
            {idpTextData.recover_username
              ? I18n.t("authentication.idp_login.dualRecoverDescription")
              : I18n.t("authentication.idp_login.recoverDescription")}
          </Markdown>
          <View spacer={true} />
          {idpTextData.recover_username && (
            <React.Fragment>
              <BlockButtons
                type={"SingleButton"}
                leftButton={{
                  title: I18n.t("authentication.idp_login.recoverUsername"),
                  onPress: handleItemOnPress(idpTextData.recover_username),
                  small: true
                }}
              />
              <View spacer={true} />
            </React.Fragment>
          )}
          <BlockButtons
            type={"SingleButton"}
            leftButton={{
              title: I18n.t("authentication.idp_login.recoverPassword"),
              onPress: handleItemOnPress(idpTextData.recover_password),
              small: true
            }}
          />

          {/** Idp cotnacts */}
          <View spacer={true} />
          <Markdown>{idpTextData.description}</Markdown>
          <View spacer={true} />

          <EmailCallCTA
            phone={idpTextData.phone}
            email={idpTextData.email ? idpTextData.email : undefined}
          />
          <View spacer={true} />

          {idpTextData.helpdesk_form && (
            <React.Fragment>
              <BlockButtons
                type={"SingleButton"}
                leftButton={{
                  title: I18n.t("authentication.idp_login.openTicket"),
                  onPress: handleItemOnPress(idpTextData.helpdesk_form),
                  primary: true,
                  bordered: true,
                  small: true
                }}
              />
              <View spacer={true} />
            </React.Fragment>
          )}
        </React.Fragment>
      )
    };
  }

  public render() {
    const { loggedOutWithIdpAuth, loggedInAuth } = this.props;
    const hasError = pot.isError(this.state.requestState);

    if (loggedInAuth) {
      return <IdpSuccessfulAuthentication />;
    }

    if (!loggedOutWithIdpAuth) {
      // This condition will be true only temporarily (if the navigation occurs
      // before the redux state is updated succesfully)
      return <LoadingSpinnerOverlay isLoading={true} />;
    }
    const loginUri = getIdpLoginUri(loggedOutWithIdpAuth.idp.entityID);

    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={this.contextualHelp}
        faqCategories={["authentication_SPID"]}
        headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
          loggedOutWithIdpAuth.idp.name
        }`}
      >
        {!hasError && (
          <WebView
            textZoom={100}
            source={{ uri: loginUri }}
            onError={this.handleLoadingError}
            javaScriptEnabled={true}
            onNavigationStateChange={this.handleNavigationStateChange}
            onShouldStartLoadWithRequest={this.handleShouldStartLoading}
          />
        )}
        {this.renderMask()}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const selectedtIdp = selectedIdentityProviderSelector(state);

  const selectedIdpTextData = fromNullable(selectedtIdp).fold(none, idp =>
    idpContextualHelpDataFromIdSelector(idp.id)(state)
  );

  return {
    loggedOutWithIdpAuth: isLoggedOutWithIdp(state.authentication)
      ? state.authentication
      : undefined,
    loggedInAuth: isLoggedIn(state.authentication)
      ? state.authentication
      : undefined,
    selectedIdpTextData
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchIdpLoginUrlChanged: (url: string) =>
    dispatch(idpLoginUrlChanged({ url })),
  dispatchLoginSuccess: (token: SessionToken) => dispatch(loginSuccess(token)),
  dispatchLoginFailure: (error: Error) => dispatch(loginFailure(error))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdpLoginScreen);
