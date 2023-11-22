/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import * as React from "react";
import { Alert, BackHandler, NativeEventSubscription } from "react-native";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import WebView from "react-native-webview";
import { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import { FooterWithButtons, VSpacer } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../../../../../components/LoadingSpinnerOverlay";
import GenericErrorComponent from "../../../../../../components/screens/GenericErrorComponent";
import TopScreenComponent from "../../../../../../components/screens/TopScreenComponent";
import I18n from "../../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../../../store/actions/types";
import { SessionToken } from "../../../../../../types/SessionToken";
import { originSchemasWhiteList } from "../../../../../../screens/authentication/originSchemasWhiteList";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import {
  loginFailure,
  loginSuccess
} from "../../../../store/actions/itwCieActions";

export type ItwCieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
  pidData: PidData;
};

type OwnProps = {
  isLoading: boolean;
};

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUING_PID_CIE_CONSENT_DATA_USAGE"
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

// This JS code is used to customize the page
// to avoid session error. This is a temporary solution
// only for the PoC purpose
const jsCode = `
  const article = document.querySelector('article');
  article.className = 'u-padding-left-xl';
  const div = document.createElement('div');
  div.innerHTML = \`
    <p class="u-padding-bottom-l">I seguenti dati stanno per essere inviati a: <br/><b>IO - l'app dei servizi pubblici</b></p>
    <p class="u-padding-bottom-xs">Nome</p>
    <p class="u-padding-bottom-xs">Cognome</p>
    <p class="u-padding-bottom-xs">Data di nascita</p>
    <p class="u-padding-bottom-xs">Codice Fiscale</p>
  \`;
  article.replaceChildren(div);
`;

class ItwCieConsentDataUsageScreen extends React.Component<Props, State> {
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
      screen: ITW_ROUTES.ISSUING.PID.AUTH_INFO
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
    // Instead of using the URI passed as a parameter, we use this
    // to get a generic ipzs welcome page and use the JS code
    // replacing the content with only the necessary data.
    // NOTE: This is a temporary solution only for the PoC purpose
    return "https://collaudo.idserver.servizicie.interno.gov.it/idp";
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
          image={require("../../../../../../../img/broken-link.png")} // TODO: use custom or generic image?
          text={I18n.t(errorTranslationKey, {
            defaultValue: I18n.t("authentication.errors.spid.unknown")
          })}
        />
      );
    } else {
      return (
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          originWhitelist={originSchemasWhiteList}
          source={{ uri: decodeURIComponent(this.cieAuthorizationUri) }}
          javaScriptEnabled={true}
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
          primary={{
            type: "Outline",
            buttonProps: {
              color: "primary",
              accessibilityLabel: I18n.t(
                "features.itWallet.issuing.infoConsent.footer.cancel"
              ),
              onPress: this.resetNavigation,
              label: I18n.t(
                "features.itWallet.issuing.infoConsent.footer.cancel"
              )
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              color: "primary",
              accessibilityLabel: I18n.t(
                "features.itWallet.issuing.infoConsent.footer.confirm"
              ),
              onPress: () =>
                this.props.navigation.navigate(ITW_ROUTES.ISSUING.PID.REQUEST, {
                  pidData: this.props.route.params.pidData
                }),
              label: I18n.t(
                "features.itWallet.issuing.infoConsent.footer.confirm"
              )
            }
          }}
          type="TwoButtonsInlineHalf"
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

export default connect(null, mapDispatchToProps)(ItwCieConsentDataUsageScreen);
