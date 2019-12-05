import { Container, H1, Text, View, Button } from "native-base";
import * as React from "react";
import { Image, NavState, StyleSheet } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationScreenProps
} from "react-navigation";
import ScreenHeader from "../../../components/ScreenHeader";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import variables from "../../../theme/variables";
import { isNfcEnabled, openNFCSettings } from "../../../utils/cie";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import WebView from "react-native-webview";
import { navigateToCieCardReaderScreen } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { connect } from "react-redux";

type NavigationParams = {
  cieConsentUri: string;
};

type OwnProps = {
  isLoading: boolean;
  ciePin: string;
};

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}> &
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
  }
});

const brokenLinkImage = require("../../../../img/broken-link.png");

class CieConsentDataUsageScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isLoading: false, findOpenApp: false };
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

  private renderWebView() {
    if (this.state.hasError) {
      return this.renderError();
    }
    return (
      <View style={{ flex: 1 }}>
        <WebView
          javaScriptEnabled={true}
          onError={this.handleWebViewError}
          source={{
            uri: this.cieAuthorizationUri
          }}
        />
      </View>
    );
  }
  public render(): React.ReactNode {
    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent goBack={true}>
        {this.renderWebView()}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={this.state.isLoading} />;
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
)(CieConsentDataUsageScreen);
