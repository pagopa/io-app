import { List } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { connect } from "react-redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { userDataProcessingLoad } from "../../store/actions/userDataProcessing";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.contextualHelpTitle",
  body: "profile.main.privacy.contextualHelpContent"
};

/**
 * A component to show the main screen of the Privacy section
 */
class PrivacyMainScreen extends React.PureComponent<Props> {
  private handleDeleteOrDownloadUserData = () => {
    this.props.loadUserDataProcessing();
  };

  public render() {
    return (
      <TopScreenComponent
        goBack={() => this.props.navigation.goBack()}
        contextualHelpMarkdown={contextualHelpMarkdown}
        title={I18n.t("profile.main.screenTitle")}
      >
        <ScreenContent
          title={I18n.t("profile.main.mainPrivacy.screenTitle")}
          subtitle={I18n.t("profile.main.mainPrivacy.screenSubtitle")}
        >
          <List withContentLateralPadding={true}>
            {/* Privacy Policy*/}
            <ListItemComponent
              title={I18n.t("profile.main.mainPrivacy.privacyPolicy.title")}
              subTitle={I18n.t(
                "profile.main.mainPrivacy.privacyPolicy.description"
              )}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PROFILE_PRIVACY)
              }
              useExtendedSubTitle={true}
            />

            {/* Remove account */}
            <ListItemComponent
              title={I18n.t("profile.main.mainPrivacy.removeAccount.title")}
              subTitle={I18n.t(
                "profile.main.mainPrivacy.removeAccount.description"
              )}
              onPress={this.handleDeleteOrDownloadUserData}
              useExtendedSubTitle={true}
            />

            {/* Export your data */}
            <ListItemComponent
              title={I18n.t("profile.main.mainPrivacy.exportData.title")}
              subTitle={I18n.t(
                "profile.main.mainPrivacy.exportData.description"
              )}
              onPress={this.handleDeleteOrDownloadUserData}
              useExtendedSubTitle={true}
            />

            <EdgeBorderComponent />
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserDataProcessing: () =>
    dispatch(
      userDataProcessingLoad.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(PrivacyMainScreen);
