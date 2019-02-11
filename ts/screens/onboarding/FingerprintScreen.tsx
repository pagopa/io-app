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

import { BiometrySimpleType } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import { Dispatch } from "../../store/actions/types";

type NavigationParams = {
  biometryType: BiometrySimpleType;
};

type OwnProps = NavigationScreenProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

type State = {
  isAbortOnboardingModalVisible: boolean;
};

/**
 * A screen to show if the fingerprint is supported to the user.
 */
export class FingerprintScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isAbortOnboardingModalVisible: false
    };
  }

  private renderBiometryType(biometryType: BiometrySimpleType): string {
    switch (biometryType) {
      case "FINGERPRINT":
        return "Fingerprint";
      case "FACE_ID":
        return "FaceID";
      case "TOUCH_ID":
        return "TouchID";
      case "NOT_ENROLLED":
        return "Not Enrolled";
      default:
        return "Unavailable";
    }
  }

  public render() {
    const { isAbortOnboardingModalVisible } = this.state;
    const biometryType = this.props.navigation.getParam("biometryType");

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
      >
        <Content noPadded={true}>
          <View content={true}>
            <Text>
              {biometryType !== "NOT_ENROLLED"
                ? I18n.t("onboarding.fingerprint.body.enrolled", {
                    biometryType: this.renderBiometryType(biometryType)
                  })
                : I18n.t("onboarding.fingerprint.body.notEnrolled")}
            </Text>
          </View>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={this.props.fingerprintAcknowledgeRequest}
          >
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
        </View>

        {isAbortOnboardingModalVisible && (
          <AbortOnboardingModal
            onClose={this.handleModalClose}
            onConfirm={this.handleModalConfirm}
          />
        )}
      </BaseScreenComponent>
    );
  }

  private handleGoBack = () =>
    this.setState({ isAbortOnboardingModalVisible: true });

  private handleModalClose = () =>
    this.setState({ isAbortOnboardingModalVisible: false });

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
