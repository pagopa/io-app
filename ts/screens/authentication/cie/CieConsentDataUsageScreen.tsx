import { Button, Container, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import {
  NavigationScreenProp,
  NavigationScreenProps,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { RefreshIndicator } from "../../../components/ui/RefreshIndicator";
import I18n from "../../../i18n";
import { resetToAuthenticationRoute } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import variables from "../../../theme/variables";

type NavigationParams = {
  cieConsentUri: string;
};

type OwnProps = {
  isLoading: boolean;
  ciePin: string;
};

type Props =  NavigationScreenProp<NavigationState> &
  OwnProps &
  NavigationScreenProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  hasError: boolean;
  isLoading: boolean;
  findOpenApp: boolean;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: variables.contentPadding
  },
  text: {
    fontSize: variables.fontSizeBase
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
  refreshIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  }
});

const brokenLinkImage = require("../../../../img/broken-link.png");

class CieConsentDataUsageScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isLoading: true, findOpenApp: false };
  }

  private handleBackPress = () => {
    // only for tests purpose
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

  private goBack = this.props.navigation.goBack;

  private handleWebViewError = () => {
    this.setState({ hasError: true });
  };
  private renderError = () => {
    return (
      <View style={styles.errorContainer}>
        <Image source={brokenLinkImage} resizeMode="contain" />
        <Text style={styles.errorTitle} bold={true}>
          {I18n.t("authentication.errors.network.title")}
        </Text>
        )}
        <View style={styles.errorButtonsContainer}>
          <Button
            onPress={this.goBack}
            style={styles.cancelButtonStyle}
            block={true}
            light={true}
            bordered={true}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
          <Button
            onPress={undefined}
            style={{ flex: 2 }}
            block={true}
            primary={true}
          >
            <Text>{I18n.t("global.buttons.retry")}</Text>
          </Button>
        </View>
      </View>
    );
  };

  private updateLoadingState = (isLoading: boolean) =>
    this.setState({ isLoading });

  private renderWebView() {
    if (this.state.hasError) {
      return this.renderError();
    }
    return (
      <Container>
        <WebView
          textZoom={100}
          source={{ uri: this.cieAuthorizationUri }}
          javaScriptEnabled={true}
          onLoadStart={() => this.updateLoadingState(true)}
          onError={this.handleWebViewError}
          onLoadEnd={() => this.updateLoadingState(false)}
        />
        {this.state.isLoading && (
          <View style={styles.refreshIndicatorContainer}>
            <RefreshIndicator />
          </View>
        )}
      </Container>
    );
  }
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent goBack={false}>
        {this.renderWebView()}
      </BaseScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchResetNavigation: () => dispatch(resetToAuthenticationRoute)
});

export default connect(
  null,
  mapDispatchToProps
)(CieConsentDataUsageScreen);
