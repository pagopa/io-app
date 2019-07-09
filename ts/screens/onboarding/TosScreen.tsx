import * as pot from "italia-ts-commons/lib/pot";
import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { StyleSheet } from "react-native";
import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import { tosVersion } from "../../config";
import I18n from "../../i18n";
import { abortOnboarding, tosAccepted } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps & ReturnType<typeof mapStateToProps>;

type State = {
  showAbortOnboardingModal: boolean;
};

const styles = StyleSheet.create({
  alert: {
    backgroundColor: "#c1f4f2",
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
    fontWeight: "700",
    paddingTop: customVariables.spacerLargeHeight
  },
  horizontalPadding: {
    paddingHorizontal: customVariables.contentPadding
  }
});

/**
 * A screen to show the ToS to the user.
 */
class TosScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAbortOnboardingModal: false
    };
  }

  public render() {
    const { navigation, dispatch } = this.props;

    const isProfile = navigation.getParam("isProfile", false);

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={
          isProfile
            ? I18n.t("profile.main.screenTitle")
            : I18n.t("onboarding.tos.headerTitle")
        }
      >
        <Content noPadded={true}>
          <H4 style={[styles.boldH4, styles.horizontalPadding]}>
            {I18n.t("profile.main.privacy.header")}
          </H4>
          {!this.props.hasPreviousAcceptedToS && (
            <View style={styles.alert}>
              <Text>{I18n.t("profile.main.privacy.updated")}</Text>
            </View>
          )}
          <View style={styles.horizontalPadding}>
            <Markdown>{I18n.t("profile.main.privacy.text")}</Markdown>
          </View>
        </Content>
        {isProfile === false && (
          <View footer={true}>
            <Button
              block={true}
              primary={true}
              onPress={() => dispatch(tosAccepted())}
            >
              <Text>{I18n.t("onboarding.tos.continue")}</Text>
            </Button>
          </View>
        )}

        {this.state.showAbortOnboardingModal && (
          <AbortOnboardingModal
            onClose={this.handleModalClose}
            onConfirm={this.handleModalConfirm}
          />
        )}
      </BaseScreenComponent>
    );
  }

  private handleGoBack = () =>
    this.setState({ showAbortOnboardingModal: true });

  private handleModalClose = () =>
    this.setState({ showAbortOnboardingModal: false });

  private handleModalConfirm = () => {
    this.handleModalClose();
    this.props.dispatch(abortOnboarding());
  };
}

// If the user had accepted a previous version of ToS
// it is displayed a related alert
function mapStateToProps(state: GlobalState) {
  const potProfile = profileSelector(state);
  return {
    hasPreviousAcceptedToS:
      pot.isSome(potProfile) &&
      potProfile.value.has_profile &&
      (("accepted_tos_version" in potProfile.value &&
        potProfile.value.accepted_tos_version !== tosVersion) ||
        !("accepted_tos_version" in potProfile.value))
  };
}

export default connect(mapStateToProps)(TosScreen);
