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
  requestUserDataProcessing,
  resetUserDataProcessingRequest
} from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { showToast } from "../../utils/showToast";

type Props = NavigationScreenProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = Readonly<{
  isAlertShown: boolean;
}>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitle",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContent"
};

class PrivacyMainScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isAlertShown: false };
  }
  private handleUserDataRequestAlert = (
    choice: UserDataProcessingChoiceEnum
  ) => {
    const requestState = this.props.userDataProcessing[choice];
    if (
      pot.isSome(requestState) &&
      (requestState.value === undefined ||
        requestState.value.status === UserDataProcessingStatusEnum.CLOSED)
    ) {
      const title = {
        DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.requestTitle"),
        DELETE: I18n.t("profile.main.privacy.removeAccount.alert.requestTitle")
      };
      const subtitle = {
        DOWNLOAD: undefined,
        DELETE: I18n.t(
          "profile.main.privacy.removeAccount.alert.requestSubtitle"
        )
      };

      Alert.alert(title[choice], subtitle[choice], [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel",
          onPress: () => this.props.resetRequest(choice)
        },
        {
          text: I18n.t("global.buttons.continue"),
          style: "default",
          onPress: () => {
            this.handleConfirmAlert(choice);
            this.props.requestUserDataProcessing(choice);
          }
        }
      ]);
    } else {
      this.handleConfirmAlert(choice, true);
    }
  };

  private handleConfirmAlert = (
    choice: UserDataProcessingChoiceEnum,
    hasExistingRequest: boolean = false
  ) => {
    const title = hasExistingRequest
      ? {
          DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.oldRequest"),
          DELETE: I18n.t("profile.main.privacy.removeAccount.alert.oldRequest")
        }
      : {
          DOWNLOAD: I18n.t(`profile.main.privacy.exportData.alert.newRequest`),
          DELETE: I18n.t("profile.main.privacy.removeAccount.alert.newRequest")
        };

    const subtitle = {
      DOWNLOAD: I18n.t("profile.main.privacy.exportData.alert.confirmSubtitle"),
      DELETE: I18n.t("profile.main.privacy.removeAccount.alert.confirmSubtitle")
    };
    Alert.alert(title[choice], subtitle[choice]);
    this.setState({ isAlertShown: true });
  };

  public componentDidUpdate(prevProps: Props) {
    // If the new request submission fails, show an alert and hide the 'in prorgess' badge
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
        } else if (pot.isNone(prevProps.userDataProcessing[choice])) {
          this.handleUserDataRequestAlert(choice);
        } else if (!this.state.isAlertShown) {
          // The request has been sent
          this.handleConfirmAlert(choice);
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

  public render() {
    const ContentComponent = withLoadingSpinner(() => (
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
              onPress={() =>
                this.props.loadUserDataRequest(
                  UserDataProcessingChoiceEnum.DELETE
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                pot.isSome(this.props.userDataProcessing.DELETE) &&
                !pot.isError(this.props.userDataProcessing.DELETE)
                  ? I18n.t("profile.preferences.list.wip")
                  : undefined
              }
            />

            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.privacy.exportData.title")}
              subTitle={I18n.t("profile.main.privacy.exportData.description")}
              onPress={() =>
                this.props.loadUserDataRequest(
                  UserDataProcessingChoiceEnum.DOWNLOAD
                )
              }
              useExtendedSubTitle={true}
              titleBadge={
                pot.isSome(this.props.userDataProcessing.DOWNLOAD) &&
                !pot.isError(this.props.userDataProcessing.DOWNLOAD)
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
        isLoading={this.props.isLoading}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserDataRequest: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(loadUserDataProcessing.request(choice)),
  requestUserDataProcessing: (choice: UserDataProcessingChoiceEnum) =>
    dispatch(requestUserDataProcessing.request(choice)),
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
    isLoading
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivacyMainScreen);
