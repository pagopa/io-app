import { Button, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import I18n from "../../i18n";
import { Dispatch } from "../../store/actions/types";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { BiometrySimpleType } from "../../sagas/startup/checkAcknowledgedFingerprintSaga";
import {
  abortOnboarding,
  fingerprintAcknowledge
} from "../../store/actions/onboarding";

type NavigationParams = {
  biometryType: BiometrySimpleType;
};

export type BiometryPrintableSimpleType =
  | "FINGERPRINT"
  | "TOUCH_ID"
  | "FACE_ID";

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

  /**
   * Print the only BiometrySimplePrintableType values that are passed to the UI
   * @param biometrySimplePrintableType
   */
  private renderBiometryType(
    biometryPrintableSimpleType: BiometryPrintableSimpleType
  ): string {
    switch (biometryPrintableSimpleType) {
      case "FINGERPRINT":
        return I18n.t("onboarding.fingerprint.body.enrolledType.fingerprint");
      case "FACE_ID":
        return I18n.t("onboarding.fingerprint.body.enrolledType.faceId");
      case "TOUCH_ID":
        return I18n.t("onboarding.fingerprint.body.enrolledType.touchId");
    }
  }

  /**
   * Print the icon according to current biometry status
   * @param biometrySimplePrintableType
   */
  private renderIcon(biometryType: BiometrySimpleType) {
    switch (biometryType) {
      case "FACE_ID":
        return require("../../../img/icons/faceid-onboarding-icon.png");
      case "FINGERPRINT":
      case "TOUCH_ID":
      case "NOT_ENROLLED":
      case "UNAVAILABLE":
        return require("../../../img/icons/fingerprint-onboarding-icon.png");
    }
  }

  public render() {
    const { isAbortOnboardingModalVisible } = this.state;
    const biometryType = this.props.navigation.getParam("biometryType");

    return (
      <TopScreenComponent
        goBack={this.handleGoBack}
        headerTitle={I18n.t("onboarding.fingerprint.headerTitle")}
        title={I18n.t("onboarding.fingerprint.title")}
        icon={this.renderIcon(biometryType)}
      >
        <ScreenContent noPadded={true}>
          <View content={true}>
            <Text>
              {biometryType !== "NOT_ENROLLED"
                ? I18n.t("onboarding.fingerprint.body.enrolledText", {
                    biometryType: this.renderBiometryType(
                      biometryType as BiometryPrintableSimpleType
                    )
                  })
                : I18n.t("onboarding.fingerprint.body.notEnrolledText")}
            </Text>
          </View>
        </ScreenContent>
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
      </TopScreenComponent>
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
