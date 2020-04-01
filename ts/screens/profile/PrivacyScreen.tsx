/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 */
import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
import { privacyUrl } from "../../config";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";

import customVariables from "../../theme/variables";

type Props = ReduxProps;
type State = {
  isLoading: boolean;
  hasError: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

const brokenLinkImage = require("../../../img/broken-link.png");

const styles = StyleSheet.create({
  alert: {
    backgroundColor: customVariables.toastColor,
    borderRadius: 4,
    marginTop: customVariables.spacerLargeHeight,
    marginBottom: 0,
    paddingVertical: customVariables.spacingBase,
    paddingHorizontal: customVariables.contentPadding,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "flex-start"
  },
  boldH4: {
    fontWeight: customVariables.textBoldWeight,
    paddingTop: customVariables.spacerLargeHeight
  },
  horizontalPadding: {
    paddingHorizontal: customVariables.contentPadding
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "red"
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

/**
 * A screen to show the ToS to the user.
 */
class PrivacyScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    // it start with loading webview
    this.state = { isLoading: true, hasError: false };
  }

  private handleLoadEnd = () => {
    this.setState({ isLoading: false });
  };

  private handleError = () => {
    this.setState({ isLoading: false, hasError: true });
  };

  private renderError = () => {
    if (this.state.hasError === false) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Image source={brokenLinkImage} resizeMode="contain" />
        <Text style={styles.errorTitle} bold={true}>
          {I18n.t("onboarding.tos.error")}
        </Text>

        <View style={styles.errorButtonsContainer}>
          <ButtonDefaultOpacity
            onPress={() => {
              this.setState({ isLoading: true, hasError: false });
            }}
            style={{ flex: 2 }}
            block={true}
            primary={true}
          >
            <Text>{I18n.t("global.buttons.retry")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </View>
    );
  };

  public render() {
    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("profile.main.privacy.privacyPolicy.title")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <H4 style={[styles.boldH4, styles.horizontalPadding]}>
          {I18n.t("profile.main.privacy.privacyPolicy.header")}
        </H4>
        {this.renderError()}
        {this.state.hasError === false && (
          <View style={styles.webViewContainer}>
            <WebView
              textZoom={100}
              style={{ flex: 1 }}
              onLoadEnd={this.handleLoadEnd}
              onError={this.handleError}
              source={{ uri: privacyUrl }}
            />
          </View>
        )}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={this.state.isLoading} />;
  }
}

export default PrivacyScreen;
