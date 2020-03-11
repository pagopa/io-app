/**
 * A screen to show the main screen of the Privacy section.
 * Here the user can:
 * - display the accepted privacypolicy (or Term of Service)
 * - send a request to delete his profile
 * - send a request to export all his data (receiving them by email)
 */
import * as pot from "italia-ts-commons/lib/pot";
import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import {
  manageUserDataDeletion,
  manageUserDataDownloading
} from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import {
  userDataDeletionProcessingSelector,
  userDataDownloadingProcessingSelector
} from "../../store/reducers/userDataProcessing";
import { showToast } from "../../utils/showToast";

type Props = NavigationScreenProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = Readonly<{
  isWaitingDeletion: boolean;
  isWaitingDownloading: boolean;
}>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitle",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContent"
};

class PrivacyMainScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isWaitingDeletion: false,
      isWaitingDownloading: false
    };
  }

  private handleDeleteUserData = () => {
    Alert.alert(I18n.t("profile.main.privacy.removeAccount.alert"), undefined, [
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      },
      {
        text: I18n.t("global.buttons.continue"),
        style: "default",
        onPress: () => {
          this.setState({ isWaitingDeletion: true });
          this.props.deleteUserData();
        }
      }
    ]);
  };

  private handleDownloadUserData = () => {
    Alert.alert(I18n.t("profile.main.privacy.exportData.alert"), undefined, [
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      },
      {
        text: I18n.t("global.buttons.continue"),
        style: "default",
        onPress: () => {
          this.setState({ isWaitingDownloading: true });
          this.props.downloadUserData();
        }
      }
    ]);
  };

  public compomentWillMount() {
    if (
      pot.isSome(this.props.userDataDeletionProcessing) &&
      this.props.userDataDeletionProcessing.value.status !==
        UserDataProcessingStatusEnum.CLOSED
    ) {
      this.setState({ isWaitingDeletion: true });
    }

    if (
      pot.isSome(this.props.userDataDownloadingProcessing) &&
      this.props.userDataDownloadingProcessing.value.status !==
        UserDataProcessingStatusEnum.CLOSED
    ) {
      this.setState({ isWaitingDownloading: true });
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // If the request submission fails, show an alert and remove the 'in prorgess' badge
    if (
      pot.isError(this.props.userDataDeletionProcessing) &&
      ((pot.isUpdating(prevProps.userDataDeletionProcessing) &&
        !pot.isUpdating(this.props.userDataDeletionProcessing)) ||
        (pot.isLoading(prevProps.userDataDeletionProcessing) &&
          !pot.isLoading(this.props.userDataDeletionProcessing)))
    ) {
      showToast(I18n.t("profile.main.privacy.removeAccount.error"));
      this.setState({ isWaitingDeletion: false });
    }

    if (
      pot.isError(this.props.userDataDownloadingProcessing) &&
      ((pot.isUpdating(prevProps.userDataDownloadingProcessing) &&
        !pot.isUpdating(this.props.userDataDownloadingProcessing)) ||
        (pot.isLoading(prevProps.userDataDownloadingProcessing) &&
          !pot.isLoading(this.props.userDataDownloadingProcessing)))
    ) {
      showToast(I18n.t("profile.main.privacy.exportData.error"));
      this.setState({ isWaitingDownloading: false });
    }
  }

  public render() {
    return (
      <TopScreenComponent
        goBack={() => this.props.navigation.goBack()}
        contextualHelpMarkdown={contextualHelpMarkdown}
        title={I18n.t("profile.main.title")}
      >
        <ScreenContent
          title={I18n.t("profile.main.privacy.title")}
          subtitle={I18n.t("profile.main.privacy.subtitle")}
          bounces={false}
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
              onPress={this.handleDeleteUserData}
              useExtendedSubTitle={true}
              titleBadge={
                this.state.isWaitingDeletion
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />

            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.exportData.title")}
              subTitle={I18n.t("profile.main.privacy.exportData.description")}
              onPress={this.handleDownloadUserData}
              useExtendedSubTitle={true}
              titleBadge={
                this.state.isWaitingDownloading
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
  deleteUserData: () => dispatch(manageUserDataDeletion()),
  downloadUserData: () => dispatch(manageUserDataDownloading())
});

const mapStateToProps = (state: GlobalState) => ({
  userDataDeletionProcessing: userDataDeletionProcessingSelector(state),
  userDataDownloadingProcessing: userDataDownloadingProcessingSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyMainScreen);
