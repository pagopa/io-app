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
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../definitions/backend/UserDataProcessingStatus";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import {
  loadUserDataProcessing,
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { showToast } from "../../utils/showToast";

type Props = NavigationScreenProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  // flag to know if we are loading data from an user choice
  requestProcess: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitle",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContent"
};

const requestAlertTitle = {
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.requestTitle"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.requestTitle")
};

const requestAlertSubtitle = {
  DOWNLOAD: undefined,
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.requestSubtitle")
};

const confirmAlertTitle = {
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.oldRequest"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequest")
};

const confirmAlertSubtitle = {
  DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.confirmSubtitle"),
  DELETE: I18n.t("profile.main.privacy.removeAccount.alert.confirmSubtitle")
};

const needValidatedEmailTitle = I18n.t(
  "profile.alerts.emailNotValidated.title"
);
const needValidatedEmailSubtitle = I18n.t(
  "profile.alerts.emailNotValidated.subtitle"
);

class PrivacyMainScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { requestProcess: false };
  }

  public componentDidMount() {
    // get a fresh info about DOWNLOAD/DELETE state
    // if any of these is WIP a relative badge will be displayed
    this.props.loadUserDataRequest(UserDataProcessingChoiceEnum.DELETE);
    this.props.loadUserDataRequest(UserDataProcessingChoiceEnum.DOWNLOAD);
  }

  // Show an alert reporting the request has been submitted
  private handleUserDataRequestAlert = (
    choice: UserDataProcessingChoiceEnum
  ) => {
    const requestState = this.props.userDataProcessing[choice];
    if (
      pot.isSome(requestState) &&
      (requestState.value === undefined ||
        requestState.value.status === UserDataProcessingStatusEnum.CLOSED)
    ) {
      // if user asks for download, navigate to a screen to inform about the process
      // there he/she can request to download his/her data
      if (choice === UserDataProcessingChoiceEnum.DOWNLOAD) {
        this.props.navigation.navigate({
          routeName: ROUTES.PROFILE_DOWNLOAD_DATA
        });
        return;
      }
      Alert.alert(requestAlertTitle[choice], requestAlertSubtitle[choice], [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel",
          onPress: () => this.props.resetRequest(choice)
        },
        {
          text: I18n.t("global.buttons.continue"),
          style: "default",
          onPress: () => {
            this.props.upsertUserDataProcessing(choice);
          }
        }
      ]);
    } else {
      this.handleConfirmAlert(choice);
    }
  };

  // show an alert to confirm the request sumbission
  private handleConfirmAlert = (choice: UserDataProcessingChoiceEnum) => {
    Alert.alert(confirmAlertTitle[choice], confirmAlertSubtitle[choice]);
  };

  // Handle the tap on Download or Delete data.
  // Check if the mail is validated before to send any backend request.
  private handleDownloadOrDeletePress = (
    choice: UserDataProcessingChoiceEnum
  ): void => {
    if (!this.props.isEmailValidated) {
      Alert.alert(needValidatedEmailTitle, needValidatedEmailSubtitle);
      return;
    }
    this.props.loadUserDataRequest(choice);
  };

  public componentDidUpdate(prevProps: Props) {
    // If the new request submission fails, show an alert and hide the 'in progress' badge
    // if it is the get request (prev prop is pot.none), check if show the alert to submit the request
    const checkUpdate = (
      errorMessage: string,
      choice: UserDataProcessingChoiceEnum
    ) => {
      const currentState = this.props.userDataProcessing[choice];
      if (
        pot.isLoading(prevProps.userDataProcessing[choice]) &&
        !pot.isLoading(currentState)
      ) {
        if (pot.isError(currentState)) {
          showToast(errorMessage);
        } else if (
          this.state.requestProcess &&
          pot.isNone(prevProps.userDataProcessing[choice])
        ) {
          this.setState({ requestProcess: false }, () => {
            this.handleUserDataRequestAlert(choice);
          });
        }
      }
    };
    checkUpdate(
      I18n.t("profile.main.privacy.exportData.error"),
      UserDataProcessingChoiceEnum.DOWNLOAD
    );

    checkUpdate(
      I18n.t("profile.main.privacy.removeAccount.error"),
      UserDataProcessingChoiceEnum.DELETE
    );
  }

  private canBeBadgeRendered = (
    choice: UserDataProcessingChoiceEnum
  ): boolean => {
    return (
      !pot.isError(this.props.userDataProcessing[choice]) &&
      pot.getOrElse(
        pot.map(
          this.props.userDataProcessing[choice],
          v =>
            v !== undefined && v.status !== UserDataProcessingStatusEnum.CLOSED
        ),
        false
      )
    );
  };

  public render() {
    const ContentComponent = withLoadingSpinner(() => (
      <TopScreenComponent
        goBack={this.props.navigation.goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["privacy"]}
        headerTitle={I18n.t("profile.main.title")}
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
                this.props.navigation.navigate(ROUTES.PROFILE_PRIVACY, {
                  isProfile: true
                })
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
                this.setState({ requestProcess: true }, () =>
                  this.handleDownloadOrDeletePress(
                    UserDataProcessingChoiceEnum.DELETE
                  )
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                this.canBeBadgeRendered(UserDataProcessingChoiceEnum.DELETE)
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />

            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.exportData.title")}
              subTitle={I18n.t("profile.main.privacy.exportData.description")}
              onPress={() =>
                this.setState({ requestProcess: true }, () =>
                  this.handleDownloadOrDeletePress(
                    UserDataProcessingChoiceEnum.DOWNLOAD
                  )
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                this.canBeBadgeRendered(UserDataProcessingChoiceEnum.DOWNLOAD)
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />
            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    ));
    return (
      <ContentComponent
        loadingCaption={I18n.t("profile.main.privacy.loading")}
        loadingOpacity={0.9}
        isLoading={this.props.isLoading && this.state.requestProcess}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserDataRequest: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(loadUserDataProcessing.request(choice)),
  upsertUserDataProcessing: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(upsertUserDataProcessing.request(choice)),
  resetRequest: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(resetUserDataProcessingRequest(choice))
});

const mapStateToProps = (state: GlobalState) => {
  const userDataProcessing = userDataProcessingSelector(state);

  // the state returns to pot.none to every get - we want to see the loader only during the load of the requests,
  // not when the request is confirmed by the user
  const isLoading =
    (pot.isNone(userDataProcessing.DELETE) &&
      pot.isLoading(userDataProcessing.DELETE)) ||
    (pot.isNone(userDataProcessing.DOWNLOAD) &&
      pot.isLoading(userDataProcessing.DOWNLOAD));
  return {
    userDataProcessing,
    isLoading,
    isEmailValidated: isProfileEmailValidatedSelector(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyMainScreen);
