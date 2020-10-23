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

/**
 * This JS is injection on every page load. It tries to decrease to 0 the sleeping time of a script.
 * That sleeping is used to allow user to read page content until the content changes to an automatic redirect.
 * This script also tries also to call apriIosUL.
 * If it is defined it starts the authentication process (iOS only).
 */
const injectJs = `
  seconds = 0;
  if(apriIosUL !== undefined){
  apriIosUL();
  }
`;

// to make sure the server recognizes the client as valido iPhone device (iOS only) we user a custom header
// on Android it is not required
const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const userAgent = Platform.select({ ios: iOSUserAgent, default: undefined });

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
    // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
    if (
      event.url !== undefined &&
      Platform.OS === "ios" &&
      event.url.indexOf("authnRequestString") !== -1
    ) {
      // avoid redirect and follow the 'happy path'
      if (this.webView.current !== null) {
        this.setState({ findOpenApp: true }, () => {
          this.props.onSuccess(
            // cie-ios sdk asks for "OpenApp?nextUrl=" as prefix
            event.url.replace("nextUrl=", "OpenApp?nextUrl=")
          );
        });
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (event.url && event.url.indexOf("OpenApp") !== -1) {
      this.setState({ findOpenApp: true }, () => {
        this.props.onSuccess(event.url);
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
    // inject JS on every page load
    if (this.webView.current) {
      this.webView.current.injectJavaScript(closeInjectedScript(injectJs));
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
