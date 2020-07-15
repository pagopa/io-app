/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 * This screen is used also as Privacy screen From Profile section.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, Image, StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import {
  NavigationScreenProp,
  NavigationState,
  SafeAreaView
} from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import TosWebviewComponent from "../../components/TosWebviewComponent";
import { WebViewMessage } from "../../components/ui/Markdown/types";
import { privacyUrl, tosVersion } from "../../config";
import I18n from "../../i18n";
import { abortOnboarding, tosAccepted } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { isOnboardingCompletedSelector } from "../../store/reducers/navigationHistory";
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps & ReturnType<typeof mapStateToProps>;
type State = {
  isLoading: boolean;
  hasError: boolean;
  scrollEnd: boolean;
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
    flex: 1
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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
class TosScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    // it start with loading webview
    this.state = { isLoading: true, hasError: false, scrollEnd: false };
  }

  public componentDidUpdate() {
    if (this.props.hasProfileError) {
      showToast(I18n.t("global.genericError"));
    }
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

  // A function that handles message sent by the WebView component
  private handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (this.state.scrollEnd) {
      return;
    }

    // We validate the format of the message with a dedicated codec
    const messageOrErrors = WebViewMessage.decode(
      JSON.parse(event.nativeEvent.data)
    );

    messageOrErrors.map(message => {
      if (message.type === "SCROLL_END_MESSAGE") {
        this.setState({ scrollEnd: true });
      }
    });
  };

  public render() {
    const { dispatch } = this.props;

    const shouldFooterRender =
      !this.state.hasError &&
      !this.state.isLoading &&
      !this.props.isOnbardingCompleted;

    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={this.props.isOnbardingCompleted || this.handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
        headerTitle={
          this.props.isOnbardingCompleted
            ? I18n.t("profile.main.privacy.privacyPolicy.title")
            : I18n.t("onboarding.tos.headerTitle")
        }
      >
        <SafeAreaView style={styles.webViewContainer}>
          {!this.props.hasAcceptedCurrentTos && (
            <View style={styles.alert}>
              <Text>
                {this.props.hasAcceptedOldTosVersion
                  ? I18n.t("profile.main.privacy.privacyPolicy.updated")
                  : I18n.t("profile.main.privacy.privacyPolicy.infobox")}
              </Text>
            </View>
          )}
          {this.renderError()}
          {!this.state.hasError && (
            <TosWebviewComponent
              handleError={this.handleError}
              handleLoadEnd={this.handleLoadEnd}
              handleWebViewMessage={this.handleWebViewMessage}
              url={privacyUrl}
              shouldFooterRender={shouldFooterRender}
              onExit={this.handleGoBack}
              onAcceptTos={() => dispatch(tosAccepted(tosVersion))}
            />
          )}
        </SafeAreaView>
      </BaseScreenComponent>
    ));
    return (
      <ContainerComponent
        isLoading={this.state.isLoading || this.props.isLoading}
      />
    );
  }

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
          onPress: () => this.props.dispatch(abortOnboarding())
        }
      ]
    );
}

function mapStateToProps(state: GlobalState) {
  const potProfile = profileSelector(state);
  return {
    isOnbardingCompleted: isOnboardingCompletedSelector(state),
    isLoading: pot.isUpdating(potProfile),
    hasAcceptedCurrentTos: pot.getOrElse(
      pot.map(potProfile, p => p.accepted_tos_version === tosVersion),
      false
    ),
    hasAcceptedOldTosVersion: pot.getOrElse(
      pot.map(
        potProfile,
        p =>
          !isProfileFirstOnBoarding(p) && // it's not the first onboarding
          p.accepted_tos_version !== undefined &&
          p.accepted_tos_version < tosVersion
      ),
      false
    ),
    hasProfileError: pot.isError(potProfile)
  };
}

export default connect(mapStateToProps)(TosScreen);
