/**
 * A screen to show the app Terms of Service. If the user accepted an old version
 * of ToS and a new version is available, an alert is displayed to highlight the user
 * has to accept the new version of ToS.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import { tosVersion } from "../../config";
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
  }
});

/**
 * A screen to show the ToS to the user.
 */
class TosScreen extends React.PureComponent<Props> {
  public render() {
    const { navigation, dispatch } = this.props;
    const isProfile = navigation.getParam("isProfile", false);

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={
          isProfile
            ? I18n.t("profile.main.title")
            : I18n.t("onboarding.tos.headerTitle")
        }
      >
        <Content noPadded={true}>
          <H4 style={[styles.boldH4, styles.horizontalPadding]}>
            {I18n.t("profile.main.privacy.privacyPolicy.header")}
          </H4>
          {this.props.hasAcceptedOldTosVersion && (
            <View style={styles.alert}>
              <Text>
                {I18n.t("profile.main.privacy.privacyPolicy.updated")}
              </Text>
            </View>
          )}
          <View style={styles.horizontalPadding}>
            <Markdown>
              {I18n.t("profile.main.privacy.privacyPolicy.text")}
            </Markdown>
          </View>
        </Content>

        {isProfile === false && (
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
              title: I18n.t("onboarding.tos.continue")
            }}
          />
        )}
      </BaseScreenComponent>
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

export default connect(mapStateToProps)(withLoadingSpinner(TosScreen));
