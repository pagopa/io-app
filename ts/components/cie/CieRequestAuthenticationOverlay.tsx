/**
 * A screen to manage the request of authentication once the pin of the user's CIE has been inserted+
 */
import { View } from "native-base";
import * as React from "react";
import { BackHandler, StyleSheet, Platform } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import I18n from "../../i18n";
import { getIdpLoginUri } from "../../utils/login";
import { withLoadingSpinner } from "../helpers/withLoadingSpinner";
import GenericErrorComponent from "../screens/GenericErrorComponent";
import { closeInjectedScript } from "../../utils/webview";

type Props = {
  onClose: () => void;
  onSuccess: (authorizationUri: string) => void;
};

type State = {
  hasError: boolean;
  findOpenApp: boolean;
  webViewKey: number;
  injectJavascript?: string;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});

// INFA PROD -> xx_servizicie
// INFRA DEV -> xx_servizicie_test
const CIE_IDP_ID = "xx_servizicie";

// this value assignment tries to decrease the sleeping time of a script
// sleeping is due to allow user to read page content until the content changes to an
// automatic redirect
const injectJs = `
  seconds = 0;
  true;
`;

// this is a 'fake' user-agent to send through the webView when the running device is an iOS
// this is needed because the device must be recognized as Android
const iOSUserAgent =
  "Mozilla/5.0 (Linux; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36";
const userAgent = Platform.select({ ios: iOSUserAgent, default: undefined });
// this injection is done only on iOS side. Since the server doesn't recognize iOS as a valid device it shows an error page (it is a simple UI block).
// we inject this JS code to get all info needed to continue the authentication
const iOSFollowHappyPathInjection = `window.location.href = 'https://idserver.servizicie.interno.gov.it/OpenApp?nextUrl=https://idserver.servizicie.interno.gov.it/idp/Authn/X509&name='+a+'&value='+b+'&authnRequestString='+c+'&OpText='+d+'&imgUrl='+f;`;

export default class CieRequestAuthenticationOverlay extends React.PureComponent<
  Props,
  State
> {
  private webView = React.createRef<WebView>();
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      findOpenApp: false,
      webViewKey: 1
    };
  }

  private handleBackEvent = () => {
    this.props.onClose();
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackEvent);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackEvent);
  }

  private handleOnError = () => {
    this.setState({
      hasError: true
    });
  };

  private handleOnShouldStartLoadWithRequest = (event: any): boolean => {
    if (this.state.findOpenApp) {
      return false;
    }
    // on iOS the web page script try to redirect in an error url
    if (
      Platform.OS === "ios" &&
      event.url !== undefined &&
      event.url.indexOf("errore.jsp") !== -1
    ) {
      // avoid redirect and follow the 'happy path'
      if (this.webView.current !== null) {
        this.webView.current.injectJavaScript(
          closeInjectedScript(iOSFollowHappyPathInjection)
        );
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (event.url && event.url.indexOf("OpenApp") !== -1) {
      this.setState({ findOpenApp: true }, () => {
        const authorizationUri = event.url;
        if (authorizationUri !== undefined) {
          this.props.onSuccess(authorizationUri);
        }
      });
      return false;
    }
    return true;
  };

  private renderError = () => (
    <GenericErrorComponent
      avoidNavigationEvents={true}
      onRetry={this.handleOnRetry}
      onCancel={this.props.onClose}
      image={require("../../../img/broken-link.png")} // TODO: use custom or generic image?
      text={I18n.t("authentication.errors.network.title")} // TODO: use custom or generic text?
    />
  );

  // Updating the webView key its content is refreshed
  private handleOnRetry = () => {
    const webViewKey = this.state.webViewKey + 1;
    this.setState({
      webViewKey,
      hasError: false
    });
  };

  private handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    if (e.nativeEvent.title === "Pagina web non disponibile") {
      this.handleOnError();
    }
  };

  private renderWebView() {
    return (
      <View style={styles.flex}>
        {!this.state.findOpenApp && (
          <WebView
            ref={this.webView}
            userAgent={userAgent}
            javaScriptEnabled={true}
            injectedJavaScript={injectJs}
            onLoadEnd={this.handleOnLoadEnd}
            onError={this.handleOnError}
            onShouldStartLoadWithRequest={
              this.handleOnShouldStartLoadWithRequest
            }
            source={{
              uri: getIdpLoginUri(CIE_IDP_ID)
            }}
            key={this.state.webViewKey}
          />
        )}
      </View>
    );
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return this.renderError();
    }
    const ContainerComponent = withLoadingSpinner(() => (
      <View>{this.renderWebView()}</View>
    ));
    return (
      <ContainerComponent
        isLoading={true}
        loadingOpacity={1.0}
        loadingCaption={I18n.t("global.genericWaiting")}
        onCancel={this.props.onClose}
      />
    );
  }
}
