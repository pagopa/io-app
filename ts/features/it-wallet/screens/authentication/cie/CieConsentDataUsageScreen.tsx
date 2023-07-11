/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import * as React from "react";
import { Alert, BackHandler, NativeEventSubscription } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import TopScreenComponent from "../../../../../components/screens/TopScreenComponent";
import I18n from "../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../../store/actions/types";
import { SessionToken } from "../../../../../types/SessionToken";
import { onLoginUriChanged } from "../../../../../utils/login";
import { originSchemasWhiteList } from "../../../../../screens/authentication/originSchemasWhiteList";
import { ItwParamsList } from "../../../navigation/params";
import { ITW_ROUTES } from "../../../navigation/routes";
import { loginFailure, loginSuccess } from "../../../store/actions/cie";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";

export type CieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
};

type OwnProps = {
  isLoading: boolean;
};

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_CIE_CONSENT_DATA_USAGE"
>;

type State = {
  hasError: boolean;
  errorCode?: string;
  isLoginSuccess?: boolean;
};

type Props = OwnProps & NavigationProps & ReturnType<typeof mapDispatchToProps>;

const loaderComponent = (
  <LoadingSpinnerOverlay loadingOpacity={1.0} isLoading={true}>
    <VSpacer size={16} />
  </LoadingSpinnerOverlay>
);

class CieConsentDataUsageScreen extends React.Component<Props, State> {
  private subscription: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isLoginSuccess: undefined
    };
  }

  private resetNavigation = () => {
    this.props.navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ACTIVATION.DETAILS
    });
  };

  private showAbortAlert = (): boolean => {
    // if the screen is in error state, skip the confirmation alert to go back at the landing screen
    if (this.state.hasError) {
      this.resetNavigation();
      return true;
    }
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
          onPress: this.resetNavigation
        }
      ]
    );
    return true;
  };

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.showAbortAlert
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  get cieAuthorizationUri(): string {
    return this.props.route.params.cieConsentUri;
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
    this.setState({ isLoginSuccess: true, hasError: false }, () => {
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
    this.setState({ hasError: true, errorCode });
  };

  private getContent = () => {
    if (this.state.isLoginSuccess) {
      return loaderComponent;
    }
    if (this.state.hasError) {
      const errorTranslationKey = this.state.errorCode
        ? `authentication.errors.spid.error_${this.state.errorCode}`
        : "authentication.errors.network.title";
      return (
        <GenericErrorComponent
          retryButtonTitle={I18n.t(
            "authentication.cie.dataUsageConsent.retryCTA"
          )}
          onRetry={this.resetNavigation}
          onCancel={undefined}
          image={require("../../../../../../img/broken-link.png")} // TODO: use custom or generic image?
          text={I18n.t(errorTranslationKey, {
            defaultValue: I18n.t("authentication.errors.spid.unknown")
          })}
        />
      );
    } else {
      // This JS code is used to remove the buttons from the page
      // to avoid new session token creation
      const jsCode = `
      // Get all buttons on the page
      var buttons = document.getElementsByTagName('button');

      // Convert the HTMLCollection to an array
      var buttonArray = Array.from(buttons);

      // Iterate over the array and remove each button
      buttonArray.forEach(function(button) {
        button.remove();
      });
      `;
      return (
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          originWhitelist={originSchemasWhiteList}
          source={{ uri: decodeURIComponent(this.cieAuthorizationUri) }}
          javaScriptEnabled={true}
          onShouldStartLoadWithRequest={this.handleShouldStartLoading}
          renderLoading={() => loaderComponent}
          injectedJavaScript={jsCode}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onMessage={_ => {}}
          onError={this.handleWebViewError}
          onHttpError={this.handleHttpError}
        />
      );
    }
  };

  public render(): React.ReactNode {
    const goBack = this.state.hasError ? false : this.showAbortAlert;
    return (
      <TopScreenComponent
        goBack={goBack}
        headerTitle={I18n.t("authentication.cie.genericTitle")}
      >
        {this.getContent()}
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={{
            bordered: true,
            onPress: this.resetNavigation,
            title: I18n.t("features.itWallet.issuing.infoConsent.footer.cancel")
          }}
          rightButton={{
            primary: true,
            onPress: undefined,
            title: I18n.t(
              "features.itWallet.issuing.infoConsent.footer.confirm"
            )
          }}
        />
        <VSpacer size={24} />
      </TopScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loginSuccess: (token: SessionToken) =>
    dispatch(loginSuccess({ token, idp: "cie" })),
  loginFailure: (error: Error) => dispatch(loginFailure({ error, idp: "cie" }))
});

export default connect(null, mapDispatchToProps)(CieConsentDataUsageScreen);
