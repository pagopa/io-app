import * as pot from "italia-ts-commons/lib/pot";
import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { manageUserDataProcessing } from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import {
  userDataDeletionProcessingSelector,
  userDataDownloadingProcessingSelector
} from "../../store/reducers/userDataProcessing";

type Props = NavigationScreenProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = Readonly<{
  choice?: UserDataProcessingChoiceEnum;
}>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitle",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContent"
};

/**
 * A component to show the main screen of the Privacy section
 */
class PrivacyMainScreen extends React.PureComponent<Props, State> {
  private handleDeleteOrDownloadUserData = (
    choice: UserDataProcessingChoiceEnum
  ) => {
    this.setState({ choice });
    const title =
      choice === UserDataProcessingChoiceEnum.DELETE
        ? I18n.t("profile.main.privacy.removeAccount.alert")
        : I18n.t("profile.main.privacy.exportData.alert");
    Alert.alert(
      title,
      "La richiesta sarà presa in carico ed elaborata nei prossimi giorni", // TODO: validate modal content
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.continue"),
          style: "default",
          onPress: () => this.props.manageUserDataProcessing(choice)
        }
      ]
    );
  };

  public render() {
    return (
      <TopScreenComponent
        goBack={() => this.props.navigation.goBack()}
        contextualHelpMarkdown={contextualHelpMarkdown}
        title={I18n.t("profile.main.screenTitle")}
      >
        <ScreenContent
          title={I18n.t("profile.main.privacy.title")}
          subtitle={I18n.t("profile.main.privacy.subtitle")}
        >
          <List withContentLateralPadding={true}>
            {/* Privacy Policy*/}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.privacyPolicy.title")}
              subTitle={I18n.t(
                "profile.main.privacy.privacyPolicy.description"
              )}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PROFILE_PRIVACY)
              }
              useExtendedSubTitle={true}
            />

            {/* Remove account */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.removeAccount.title")}
              subTitle={I18n.t(
                "profile.main.privacy.removeAccount.description"
              )}
              onPress={() =>
                this.handleDeleteOrDownloadUserData(
                  UserDataProcessingChoiceEnum.DELETE
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                this.props.isWaitingDeletion
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />

            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.exportData.title")}
              subTitle={I18n.t("profile.main.privacy.exportData.description")}
              onPress={() =>
                this.handleDeleteOrDownloadUserData(
                  UserDataProcessingChoiceEnum.DOWNLOAD
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                this.props.isWaitingDownloading
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  manageUserDataProcessing: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(manageUserDataProcessing(choice))
});

const mapStateToProps = (state: GlobalState) => {
  const userDataDeletionProcessing = userDataDeletionProcessingSelector(state);
  const userDataDownloadingProcessing = userDataDownloadingProcessingSelector(
    state
  );

  return {
    userDataDeletionProcessing,
    userDataDownloadingProcessing,
    isWaitingDeletion:
      pot.isSome(userDataDeletionProcessing) &&
      userDataDeletionProcessing.value.status !==
        UserDataProcessingStatusEnum.CLOSED,
    isWaitingDownloading:
      pot.isSome(userDataDownloadingProcessing) &&
      userDataDownloadingProcessing.value.status !==
        UserDataProcessingStatusEnum.CLOSED
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyMainScreen);
