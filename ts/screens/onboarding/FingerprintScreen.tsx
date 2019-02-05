import { Button, Content, Text, View } from "native-base";
import * as React from "react";

import {
  NavigationScreenProp,
  NavigationScreenProps,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import I18n from "../../i18n";
import {
  abortOnboarding,
  fingerprintAcknowledge
} from "../../store/actions/onboarding";

import { Dispatch, ReduxProps } from "../../store/actions/types";

type FingerprintScreenNavigationParams = {
  biometryType: string;
};

type OwnProps = NavigationScreenProps<FingerprintScreenNavigationParams>;

type OnBoardingProps = NavigationScreenProp<NavigationState>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OnBoardingProps;

type State = {
  showAbortOnboardingModal: boolean;
  biometryType?: string;
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

  // public componentWillMount() {
  //   TouchID.isSupported(isSupportedConfig)
  //     .then(
  //       biometryType => (biometryType === true ? "Fingerprint" : biometryType),
  //       _ => undefined
  //     )
  //     .then(biometryType => this.setState({ biometryType }), _ => 0);
  // }

  // The Body of the Screen
  public renderBody(biometryType: string | undefined) {
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
            <Text>{I18n.t("onboarding.fingerprint.continue")}</Text>
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
    this.props.dispatch(abortOnboarding());
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fingerprintAcknowledgeRequest: () =>
    dispatch(fingerprintAcknowledge.request())
});

export default connect(
  undefined,
  mapDispatchToProps
)(FingerprintScreen);
