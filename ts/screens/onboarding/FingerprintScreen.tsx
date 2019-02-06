import { Button, Content, Text, View } from "native-base";
import * as React from "react";

import { NavigationScreenProps } from "react-navigation";

import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import I18n from "../../i18n";
import {
  abortOnboarding,
  fingerprintAcknowledge
} from "../../store/actions/onboarding";

import { BiometrySimpleType } from "../../sagas/startup/checkSupportedFingerprintSaga";
import { Dispatch } from "../../store/actions/types";

type FingerprintScreenNavigationParams = {
  biometryType: BiometrySimpleType;
};

type OwnProps = NavigationScreenProps<FingerprintScreenNavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  showAbortOnboardingModal: boolean;
  biometryType?: BiometrySimpleType;
};

/**
 * A screen to show the if the fingerprint is supported to the user.
 */
export class FingerprintScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAbortOnboardingModal: false,
      biometryType: props.navigation.getParam("biometryType")
    };
  }

  // The Body of this view
  public renderBody(biometryType: BiometrySimpleType | undefined) {
    if (biometryType === "NotEnrolled") {
      return <Text>{I18n.t("onboarding.fingerprint.body.notEnrolled")}</Text>;
    } else {
      return (
        <Text>
          {I18n.t("onboarding.fingerprint.body.enrolled", { biometryType })}
        </Text>
      );
    }
  }

  public render() {
    const { showAbortOnboardingModal, biometryType } = this.state;

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
      >
        <Content noPadded={true}>
          <View content={true}>{this.renderBody(biometryType)}</View>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.fingerprintAcknowledgeRequest()}
          >
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
        </View>

        {showAbortOnboardingModal && (
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
    this.props.abortOnboarding();
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fingerprintAcknowledgeRequest: () =>
    dispatch(fingerprintAcknowledge.request()),
  abortOnboarding: () => dispatch(abortOnboarding())
});

export default connect(
  undefined,
  mapDispatchToProps
)(FingerprintScreen);
