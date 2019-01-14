import { Option } from "fp-ts/lib/Option";
import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AbortOnboardingModal from "../../components/AbortOnboardingModal";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ActivityIndicator from "../../components/ui/ActivityIndicator";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { FetchRequestActions } from "../../store/actions/constants";
import { abortOnboarding, tosAccept } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";

type ReduxMappedStateProps = {
  isAcceptingTos: boolean;
  profileUpsertError: Option<string>;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedStateProps & ReduxProps & OwnProps;

type State = {
  showAbortOnboardingModal: boolean;
};

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
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
    const {
      profileUpsertError,
      isAcceptingTos,
      navigation,
      dispatch
    } = this.props;

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
            {isAcceptingTos && (
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator />
              </View>
            )}
            {/* FIXME: handle errors */}
            {profileUpsertError.isSome() && (
              <View padder={true}>
                <Text>{I18n.t("global.actions.retry")}</Text>
              </View>
            )}
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
              disabled={isAcceptingTos}
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  isAcceptingTos: createLoadingSelector([FetchRequestActions.TOS_ACCEPT])(
    state
  ),
  // Checks from the store whether there was an error while upserting the profile.
  profileUpsertError: createErrorSelector([FetchRequestActions.PROFILE_UPSERT])(
    state
  )
});

export default connect(mapStateToProps)(TosScreen);
