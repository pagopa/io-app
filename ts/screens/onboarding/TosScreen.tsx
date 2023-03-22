/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 * This screen is used also as Privacy screen From Profile section.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Alert, Image, SafeAreaView, StyleSheet } from "react-native";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { connect } from "react-redux";
import brokenLinkImage from "../../../img/broken-link.png";
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
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { isOnboardingCompleted } from "../../utils/navigation";
import { showToast } from "../../utils/showToast";
import { openWebUrl } from "../../utils/url";

type Props = ReduxProps & ReturnType<typeof mapStateToProps>;
type State = {
  isLoading: boolean;
  hasError: boolean;
};

const styles = StyleSheet.create({
  alert: {
    backgroundColor: customVariables.toastColor,
    borderRadius: 4,
    marginTop: customVariables.spacerExtrasmallHeight,
    marginBottom: 0,
    paddingVertical: customVariables.spacingBase,
    paddingHorizontal: customVariables.contentPadding,
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "flex-start"
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
  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
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
    // it starts with loading webview
    this.state = { isLoading: true, hasError: false };
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
    if (!this.state.hasError) {
      return null;
    }
    return (
      <View style={styles.errorContainer} testID={"toSErrorContainerView"}>
        <Image
          source={brokenLinkImage}
          resizeMode="contain"
          testID={"toSErrorContainerImage"}
        />
        <NBText
          style={styles.errorTitle}
          bold={true}
          testID={"toSErrorContainerTitle"}
        >
          {I18n.t("onboarding.tos.error")}
        </NBText>

        <View style={styles.errorButtonsContainer}>
          <ButtonDefaultOpacity
            onPress={() => {
              this.setState({ isLoading: true, hasError: false });
            }}
            style={{ flex: 2 }}
            block={true}
            primary={true}
            testID={"toSErrorContainerButton"}
          >
            <NBText testID={"toSErrorContainerButtonText"}>
              {I18n.t("global.buttons.retry")}
            </NBText>
          </ButtonDefaultOpacity>
        </View>
      </View>
    );
  };

  // A function that handles message sent by the WebView component
  private handleWebViewMessage = (event: WebViewMessageEvent) =>
    pipe(
      JSON.parse(event.nativeEvent.data),
      WebViewMessage.decode,
      E.map(m => {
        if (m.type === "LINK_MESSAGE") {
          void openWebUrl(m.payload.href);
        }
      })
    );

  public render() {
    const { dispatch } = this.props;

    const onboardingCompleted = isOnboardingCompleted();

    const shouldFooterRender =
      !this.state.hasError && !this.state.isLoading && !onboardingCompleted;

    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={onboardingCompleted || this.handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
        headerTitle={
          onboardingCompleted
            ? I18n.t("profile.main.privacy.privacyPolicy.title")
            : I18n.t("onboarding.tos.headerTitle")
        }
      >
        <SafeAreaView style={styles.webViewContainer}>
          {!this.props.hasAcceptedCurrentTos && (
            <View style={styles.alert} testID={"currentToSNotAcceptedView"}>
              <NBText testID={"currentToSNotAcceptedText"}>
                {this.props.hasAcceptedOldTosVersion
                  ? I18n.t("profile.main.privacy.privacyPolicy.updated")
                  : I18n.t("profile.main.privacy.privacyPolicy.infobox")}
              </NBText>
            </View>
          )}
          {this.renderError()}
          {!this.state.hasError && (
            <TosWebviewComponent
              handleError={this.handleError}
              handleLoadEnd={this.handleLoadEnd}
              handleWebViewMessage={this.handleWebViewMessage}
              webViewSource={{ uri: privacyUrl }}
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
