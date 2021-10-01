/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onbording process
 */
import { View } from "native-base";
import * as React from "react";
import { Alert, BackHandler } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import I18n from "../../../i18n";
import {
  loginFailure,
  loginSuccess
} from "../../../store/actions/authentication";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { SessionToken } from "../../../types/SessionToken";
import { onLoginUriChanged } from "../../../utils/login";
import { IdpCIE } from "../LandingScreen";

type NavigationParams = {
  cieConsentUri: string;
};

type OwnProps = {
  isLoading: boolean;
};

type State = {
  hasError: boolean;
  isLoginSuccess?: boolean;
};

type Props = NavigationScreenProp<NavigationState> &
  OwnProps &
  NavigationStackScreenProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

const loaderComponent = (
  <LoadingSpinnerOverlay loadingOpacity={1.0} isLoading={true}>
    <View spacer={true} />
  </LoadingSpinnerOverlay>
);

class CieConsentDataUsageScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isLoginSuccess: undefined
    };
  }

  private handleBackPress = () => {
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: this.props.resetNavigation
        }
      ]
    );
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  get cieAuthorizationUri(): string {
    return this.props.navigation.getParam("cieConsentUri");
  }

  private handleWebViewError = () => {
    this.setState({ hasError: true });
  };

  private handleHttpError = (event: WebViewHttpErrorEvent) => {
    this.props.loginFailure(
      new Error(
        `HTTP error ${event.nativeEvent.description} with Authorization uri`
      )
    );
  };

  private handleLoginSuccess = (token: SessionToken) => {
    this.setState({ isLoginSuccess: true }, () => {
      this.props.loginSuccess(token);
    });
  };

  private handleShouldStartLoading = (event: WebViewNavigation): boolean => {
    const isLoginUrlWithToken = onLoginUriChanged(
      this.handleLoginFailure,
      this.handleLoginSuccess
    )(event);
    // URL can be loaded if it's not the login URL containing the session token - this avoids
    // making a (useless) GET request with the session in the URL
    return !isLoginUrlWithToken;
  };

  private handleLoginFailure = (errorCode?: string) => {
    this.props.loginFailure(
      new Error(`login CIE failure with code ${errorCode || "n/a"}`)
    );
    this.props.resetNavigation();
  };

  private handleGoBack = () =>
    Alert.alert(
      I18n.t("onboarding.alert.title"),
      I18n.t("onboarding.alert.description"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.exit"),
          style: "default",
          onPress: this.handleLoginFailure
        }
      ]
    );

  private getContent = () => {
    if (this.state.hasError) {
      return (
        <GenericErrorComponent
          onRetry={this.props.resetNavigation}
          onCancel={undefined}
          image={require("../../../../img/broken-link.png")} // TODO: use custom or generic image?
          text={I18n.t("authentication.errors.network.title")} // TODO: use custom or generic text?
        />
      );
    } else if (this.state.isLoginSuccess) {
      return loaderComponent;
    } else {
      return (
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          source={{ uri: this.cieAuthorizationUri }}
          javaScriptEnabled={true}
          onShouldStartLoadWithRequest={this.handleShouldStartLoading}
          renderLoading={() => loaderComponent}
          onError={this.handleWebViewError}
          onHttpError={this.handleHttpError}
        />
      );
    }
  };

  public render(): React.ReactNode {
    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("authentication.cie.genericTitle")}
      >
        {this.getContent()}
      </TopScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetNavigation: () => dispatch(resetToAuthenticationRoute),
  loginSuccess: (token: SessionToken) =>
    dispatch(loginSuccess({ token, idp: IdpCIE.id })),
  loginFailure: (error: Error) =>
    dispatch(loginFailure({ error, idp: IdpCIE.id }))
});

export default connect(null, mapDispatchToProps)(CieConsentDataUsageScreen);
