import { List } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

/**
 * A component to show the main screen of the Privacy section
 */
export const PrivacyMainScreen: React.SFC<Props> = props => (
  <TopScreenComponent
    goBack={() => props.navigation.goBack()}
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
          onPress={() => props.navigation.navigate(ROUTES.PROFILE_PRIVACY)}
          useExtendedSubTitle={true}
        />

        {/* Remove account */}
        <ListItemComponent
          title={I18n.t("profile.main.mainPrivacy.removeAccount.title")}
          subTitle={I18n.t(
            "profile.main.mainPrivacy.removeAccount.description"
          )}
          onPress={unavailableAlert}
          useExtendedSubTitle={true}
        />

        {/* Export your data */}
        <ListItemComponent
          title={I18n.t("profile.main.mainPrivacy.exportData.title")}
          subTitle={I18n.t("profile.main.mainPrivacy.exportData.description")}
          onPress={unavailableAlert}
          useExtendedSubTitle={true}
        />

        <EdgeBorderComponent />
      </List>
    </ScreenContent>
  </TopScreenComponent>
);
