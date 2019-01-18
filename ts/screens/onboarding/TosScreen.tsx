import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { abortOnboarding, tosAccept } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;

type State = {
  showAbortOnboardingModal: boolean;
};

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
          <View content={true}>
            <Markdown lazyOptions={{ lazy: true }}>
              {I18n.t("profile.main.privacy.text")}
            </Markdown>
          </View>
        </Content>
        {isProfile === false && (
          <View footer={true}>
            <Button
              block={true}
              primary={true}
              onPress={() => dispatch(tosAccept.request())}
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

export default connect()(TosScreen);
