import { Option } from "fp-ts/lib/Option";
import { Button, Content, H1, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ActivityIndicator from "../../components/ui/activityIndicator";

import I18n from "../../i18n";

import { FetchRequestActions } from "../../store/actions/constants";
import { tosAcceptRequest } from "../../store/actions/onboarding";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";

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
const TosScreen: React.SFC<Props> = ({
  profileUpsertError,
  isAcceptingTos,
  navigation,
  dispatch
}) => {
  const isProfile = navigation.getParam("isProfile", false);

  return (
    <BaseScreenComponent
      goBack={() => navigation.goBack()}
      headerTitle={
        isProfile
          ? I18n.t("profile.main.screenTitle")
          : I18n.t("onboarding.tos.headerTitle")
      }
    >
      <Content>
        {isAcceptingTos && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator />
          </View>
        )}
        <H1>{I18n.t("onboarding.tos.contentTitle")}</H1>
        <View spacer={true} extralarge={true} />
        {/* FIXME: handle errors */}
        {profileUpsertError.isSome() && (
          <View padder={true}>
            <Text>{I18n.t("global.actions.retry")}</Text>
          </View>
        )}
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
            onPress={() => dispatch(tosAcceptRequest)}
          >
            <Text>{I18n.t("onboarding.tos.continue")}</Text>
          </Button>
        </View>
      )}
    </BaseScreenComponent>
  );
};

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
