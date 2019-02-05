import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import I18n from "../../i18n";
import { abortOnboarding, fingerprintAcknowledge } from "../../store/actions/onboarding";

import { ReduxProps, Dispatch } from "../../store/actions/types";

// import TouchID, { IsSupportedConfig } from 'react-native-touch-id';
// import { stat } from 'fs';
// import { GlobalState } from '../../store/reducers/types';

type FingerprintScreenNavigationParams = {
  biometryType: string;
};

// type OwnProps = {
//   // navigation: NavigationScreenProp<NavigationState>;
//   navigation: NavigationScreenProp<FingerprintScreenNavigationParams>;
// };

type OwnProps = NavigationScreenProp<FingerprintScreenNavigationParams>;


type Props = ReturnType<typeof mapDispatchToProps> & ReduxProps & OwnProps;

type State = {
  showAbortOnboardingModal: boolean;
  biometryType?: string;
};

// const isSupportedConfig: IsSupportedConfig = {
//   unifiedErrors: true
// };

/**
 * A screen to show the ToS to the user.
 */
export class FingerprintScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAbortOnboardingModal: false,
      biometryType: props.getParam("biometryType")
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
  public renderBody(biometryType: string|undefined) {
    if (biometryType === "NotEnrolled")
      return (
        <Text>{I18n.t("onboarding.fingerprint.body.notEnrolled")}</Text>
      );
    else
      return (
        <Text>{I18n.t("onboarding.fingerprint.body.enrolled", { biometryType })}</Text>
      );
  }

  public render() {
    const isProfile = this.props.getParam("isProfile", false);
    
    console.log('***************')
    console.log(this.state);

    const {
      showAbortOnboardingModal,
      biometryType
    } = this.state;

    return (
      <BaseScreenComponent
        goBack={this.handleGoBack}
        headerTitle={
          isProfile
            ? I18n.t("profile.main.screenTitle")
            : I18n.t("onboarding.fingerprint.headerTitle")
        }
      >
        <Content noPadded={true}>
          <View content={true}>
            {this.renderBody(biometryType)}
          </View>
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

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
    fingerprintAcknowledgeRequest: () =>
      dispatch(fingerprintAcknowledge.request())
});

export default connect(undefined, mapDispatchToProps)(FingerprintScreen);
