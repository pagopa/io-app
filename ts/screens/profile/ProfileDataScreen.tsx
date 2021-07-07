import * as React from "react";
import { StyleSheet } from "react-native";
import { List, View, Content } from "native-base";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import {
  profileEmailSelector,
  isProfileEmailValidatedSelector,
  hasProfileEmailSelector
} from "../../store/reducers/profile";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { H1 } from "../../components/core/typography/H1";
import { H4 } from "../../components/core/typography/H4";
import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen
} from "../../store/actions/navigation";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ProfileDataScreen: React.FC<Props> = ({
  profileEmail,
  isEmailValidated,
  navigateToEmailReadScreen,
  navigateToEmailInsertScreen,
  hasProfileEmail
}): React.ReactElement => {
  const onPressEmail = () =>
    hasProfileEmail
      ? navigateToEmailReadScreen()
      : navigateToEmailInsertScreen();

  return (
    <TopScreenComponent
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["profile", "privacy", "authentication_SPID"]}
      goBack
    >
      <Content noPadded>
        <View style={styles.container}>
          <H1>{I18n.t("profile.data.title")}</H1>
          <H4 color="bluegrey" weight="Regular">
            {I18n.t("profile.data.subtitle")}
          </H4>
        </View>
        <View spacer />
        <List withContentLateralPadding>
          {/* Insert or edit email */}
          <ListItemComponent
            title={I18n.t("profile.data.list.email")}
            subTitle={profileEmail.getOrElse(
              I18n.t("global.remoteStates.notAvailable")
            )}
            titleBadge={
              !isEmailValidated
                ? I18n.t("profile.data.list.need_validate")
                : undefined
            }
            onPress={onPressEmail}
            testID="insert-or-edit-email"
          />
        </List>
      </Content>
    </TopScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToEmailReadScreen: () => dispatch(navigateToEmailReadScreen()),
  navigateToEmailInsertScreen: () => dispatch(navigateToEmailInsertScreen())
});

const mapStateToProps = (state: GlobalState) => ({
  profileEmail: profileEmailSelector(state),
  isEmailValidated: isProfileEmailValidatedSelector(state),
  hasProfileEmail: hasProfileEmailSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDataScreen);
