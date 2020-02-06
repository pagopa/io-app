/**
 * A screen to manage the request of authentication once the pin of the user's CIE has been inserted
 */
import { View } from "native-base";
import * as React from "react";
import { Alert, NavState } from "react-native";
import WebView from "react-native-webview";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import { cieAuthenticationUri } from "../../../config";
import I18n from "../../../i18n";
import { navigateToCieCardReaderScreen } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";

type NavigationParams = {
  ciePin: string;
};

type Props = NavigationScreenProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  hasError: boolean;
  isLoading: boolean;
  findOpenApp: boolean;
  webViewKey: number;
};

class CieRequestAuthenticationScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isLoading: true,
      findOpenApp: false,
      webViewKey: 1
    };
  }

  private handleNavigationStateChange = (event: NavState): void => {
    // TODO: check if we can distinguish among different type of errors
    //      some errors could suggest ro redirect the user to the landing screen , not back
    if (event.url && event.url.indexOf("errore") !== -1) {
      this.setState({
        isLoading: false,
        hasError: true
      });
    }

    if (this.state.findOpenApp) {
      return;
    }
    // Once the returned url conteins the "OpenApp" string, then the authorization has been given
    if (event.url && event.url.indexOf("OpenApp") !== -1) {
      this.setState({ findOpenApp: true });
      const authorizationUri = event.url;
      this.props.dispatchNavigationToCieCardReaderScreen(
        this.ciePin,
        authorizationUri
      );
    }
  };

  get ciePin(): string {
    return this.props.navigation.getParam("ciePin");
  }

  private handleWebViewError = () => {
    this.setState({ hasError: true });
  };

  private renderError = () => {
    return (
      <GenericErrorComponent
        onRetry={this.handleOnRetry}
        onCancel={this.handleGoBack}
        image={require("../../../../img/broken-link.png")} // TODO: use custom or generic image?
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

  // Going back the user should insert the pin again
  private handleGoBack = () => {
    if (!this.state.isLoading) {
      this.props.navigation.goBack();
    } else {
      Alert.alert(
        "Sicuro di voler annullare l'operazione in corso?",
        undefined,
        [
          {
            text: I18n.t("global.buttons.cancel"), // TODO: validate button name - the action is a cancel, it could be confusing
            style: "cancel"
          },
          {
            text: I18n.t("global.buttons.confirm"),
            style: "default",
            onPress: this.props.navigation.goBack
          }
        ]
      );
    }
  };

  private renderWebView() {
    if (this.state.hasError) {
      return this.renderError();
    }
    return (
      <View style={{ flex: 1 }}>
        <WebView
          javaScriptEnabled={true}
          onError={this.handleWebViewError}
          onNavigationStateChange={this.handleNavigationStateChange}
          source={{
            uri: cieAuthenticationUri
          }}
          key={this.state.webViewKey}
        />
      </View>
    );
  }

  public render(): React.ReactNode {
    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent goBack={this.handleGoBack}>
        {this.renderWebView()}
      </TopScreenComponent>
    ));
    return (
      <ContainerComponent
        isLoading={this.state.isLoading}
        loadingOpacity={1.0}
        loadingCaption={I18n.t("global.genericWaiting")}
        onCancel={this.handleGoBack}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchNavigationToCieCardReaderScreen: (
    ciePin: string,
    authorizationUri: string
  ) => dispatch(navigateToCieCardReaderScreen({ ciePin, authorizationUri }))
});

export default connect(
  null,
  mapDispatchToProps
)(CieRequestAuthenticationScreen);
