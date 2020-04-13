/**
 * A screen to manage the request of authentication once the pin of the user's CIE has been inserted+
 */
import { View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  NavState,
  StyleSheet,
  Platform,
  Text
} from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import I18n from "../../i18n";
import { getIdpLoginUri } from "../../utils/login";
import { withLoadingSpinner } from "../helpers/withLoadingSpinner";
import GenericErrorComponent from "../screens/GenericErrorComponent";
import TopScreenComponent from "../screens/TopScreenComponent";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";

type Props = {
  ciePin: string;
  onClose: () => void;
  onSuccess: (authorizationUri: string) => void;
};

type State = {
  hasError: boolean;
  isLoading: boolean;
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

const injectJsiOS: string = `
is.androidTablet = () => true;
is.androidPhone = () => true;
is.not.ipad = () => true;
is.chrome = () => true;
is.not.edge = () => true;
is.not.opera = () => true;
  alert("finito");
  true;
`;

// this value assignment tries to decrease the sleeping time of a script
// sleeping is due to allow user to read page content until the content changes to an
// automatic redirect
const injectJs = Platform.select({ ios: injectJsiOS, default: "" });

const iOSUserAgent =
  "Mozilla/5.0 (Linux; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36";
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
      isLoading: true,
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
      isLoading: false,
      hasError: true
    });
  };

  private handleOnShouldStartLoadWithRequest = (event: NavState): boolean => {
    if (this.state.findOpenApp) {
      return false;
    }
    if (event.url !== undefined && event.url.indexOf("errore.jsp") !== -1) {
      // injectJavascript: `window.location.href = 'https://idserver.servizicie.interno.gov.it/idp/Authn/X509&name='+a+'&OpenApp=1&value='+b+'&authnRequestString='+c;`
      this.setState({
        injectJavascript: `alert(c);window.location.href = 'https://idserver.servizicie.interno.gov.it/OpenApp?nextUrl=https://idserver.servizicie.interno.gov.it/idp/Authn/X509&name='+a+'&value='+b+'&authnRequestString='+c+'&OpText='+d+'&imgUrl='+f;`
      });
      return false;
    }
    // TODO: check if we can distinguish among different type of errors
    //      some errors could suggest ro redirect the user to the landing screen , not back
    if (event.url && event.url.indexOf("errore") !== -1) {
      this.handleOnError();
      return true;
    }
    // Once the returned url conteins the "OpenApp" string, then the authorization has been given
    if (event.url && event.url.indexOf("OpenApp") !== -1) {
      this.setState({ findOpenApp: true }, () => {
        const authorizationUri = event.url;
        if (authorizationUri !== undefined) {
          this.props.onSuccess(authorizationUri);
        }
      });
    }
    return true;
  };

  private renderError = () => {
    return (
      <GenericErrorComponent
        onRetry={this.handleOnRetry}
        onCancel={this.props.onClose}
        image={require("../../../img/broken-link.png")} // TODO: use custom or generic image?
        text={I18n.t("authentication.errors.network.title")} // TODO: use custom or generic text?
      />
    );
  };

  // Updating the webView key its content is refreshed
  private handleOnRetry = () => {
    const webViewKey = this.state.webViewKey + 1;
    this.setState({
      webViewKey,
      hasError: false,
      isLoading: true
    });
  };

  private handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    if (e.nativeEvent.title === "Pagina web non disponibile") {
      this.handleOnError();
    }
  };

  private renderWebView() {
    //if (this.state.hasError) {
    //  return this.renderError();
    //}
    return (
      <View style={styles.flex}>
        {this.state.findOpenApp === false && (
          <WebView
            ref={this.webView}
            userAgent={userAgent}
            javaScriptEnabled={true}
            injectedJavaScript={this.state.injectJavascript}
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
        <ButtonDefaultOpacity
          style={{ width: 200, height: 50, marginBottom: 20 }}
          onPress={() => {
            if (this.webView !== null && this.webView.current != null) {
              this.webView.current.goBack();
              console.warn("sono qui");
            }
          }}
        >
          <Text>{"go back"}</Text>
        </ButtonDefaultOpacity>
      </View>
    );
  }

  public render(): React.ReactNode {
    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent>{this.renderWebView()}</TopScreenComponent>
    ));
    return (
      <ContainerComponent
        isLoading={false}
        loadingOpacity={1.0}
        loadingCaption={I18n.t("global.genericWaiting")}
        onCancel={this.props.onClose}
      />
    );
  }
}
