import { Option } from "fp-ts/lib/Option";
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  H3,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { FetchRequestActions } from "../../store/actions/constants";
import { tosAcceptRequest } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {
  isAcceptingTos: boolean;
  profileUpsertError: Option<string>;
};

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxMappedProps & ReduxProps & OwnProps;

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
class TosScreen extends React.Component<Props, never> {
  private goBack() {
    this.props.navigation.goBack();
  }

  private acceptTos = () => {
    this.props.dispatch(tosAcceptRequest);
  };

  private renderActivityIndicator(animating: boolean) {
    return (
      animating && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size={"large"} color={variables.brandPrimary} />
        </View>
      )
    );
  }

  private renderErrors = () => {
    const { profileUpsertError } = this.props;

    return profileUpsertError.isSome() ? (
      <View padder={true}>
        <Text>{I18n.t("global.actions.retry")}</Text>
      </View>
    ) : null;
  };

  public render() {
    const { isAcceptingTos } = this.props;

    const isProfile = this.props.navigation.getParam("isProfile", false);

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={_ => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>
              {isProfile
                ? I18n.t("profile.main.screenTitle")
                : I18n.t("onboarding.tos.headerTitle")}
            </Text>
          </Body>
        </AppHeader>
        <Content>
          {this.renderActivityIndicator(isAcceptingTos)}
          <H1>{I18n.t("onboarding.tos.contentTitle")}</H1>
          <View spacer={true} extralarge={true} />
          {this.renderErrors()}
          <H3>{I18n.t("onboarding.tos.section1")}</H3>
          <View spacer={true} />
          <Text>{I18n.t("lipsum.medium")}</Text>
          <View spacer={true} extralarge={true} />
          <H3>{I18n.t("onboarding.tos.section2")}</H3>
          <View spacer={true} />
          <Text>{I18n.t("lipsum.medium")}</Text>
        </Content>
        {isProfile === false && (
          <View footer={true}>
            <Button
              block={true}
              primary={true}
              disabled={isAcceptingTos}
              onPress={_ => this.acceptTos()}
            >
              <Text>{I18n.t("onboarding.tos.continue")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isAcceptingTos: createLoadingSelector([FetchRequestActions.TOS_ACCEPT])(
    state
  ),
  // Checks from the store whether there was an error while upserting the profile.
  profileUpsertError: createErrorSelector([FetchRequestActions.PROFILE_UPSERT])(
    state
  )
});

export default connect(mapStateToProps)(TosScreen);
