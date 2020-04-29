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
import WebView from "react-native-webview";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { privacyUrl, tosVersion } from "../../config";
import I18n from "../../i18n";
import { abortOnboarding, tosAccepted } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import {
  isProfileFirstOnBoarding,
  profileSelector
} from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { userMetadataSelector } from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps & ReturnType<typeof mapStateToProps>;
type State = {
  isLoading: boolean;
  hasError: boolean;
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
    const { navigation, dispatch } = this.props;
    const isProfile = navigation.getParam("isProfile", false);
    const avoidZoomWebview = `
      const meta = document.createElement('meta');
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);
      `;

    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={isProfile || this.handleGoBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
        headerTitle={
          isProfile
            ? I18n.t("profile.main.privacy.privacyPolicy.title")
            : I18n.t("onboarding.tos.headerTitle")
        }
      >
        {this.props.hasAcceptedOldTosVersion && (
          <View style={styles.alert}>
            <Text>{I18n.t("profile.main.privacy.privacyPolicy.updated")}</Text>
          </View>
        )}
        {this.renderError()}
        {this.state.hasError === false && (
          <View style={styles.webViewContainer}>
            <WebView
              textZoom={100}
              style={{ flex: 1 }}
              onLoadEnd={this.handleLoadEnd}
              onError={this.handleError}
              source={{ uri: privacyUrl }}
              injectedJavaScript={avoidZoomWebview}
            />
          </View>
        )}
        {this.state.hasError === false &&
          this.state.isLoading === false &&
          isProfile === false && (
            <FooterWithButtons
              type={"TwoButtonsInlineThird"}
              leftButton={{
                block: true,
                light: true,
                bordered: true,
                onPress: this.handleGoBack,
                title: I18n.t("global.buttons.exit")
              }}
              rightButton={{
                block: true,
                primary: true,
                onPress: () => dispatch(tosAccepted(tosVersion)),
                title: I18n.t("onboarding.tos.accept")
              }}
            />
          )}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={this.state.isLoading} />;
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
    isLoading: pot.isLoading(userMetadataSelector(state)),
    hasAcceptedOldTosVersion: pot.getOrElse(
      pot.map(
        potProfile,
        p =>
          !isProfileFirstOnBoarding(p) && // it's not the first onboarding
          p.accepted_tos_version !== undefined &&
          p.accepted_tos_version < tosVersion
      ),
      false
    )
  };
}

export default connect(mapStateToProps)(TosScreen);
