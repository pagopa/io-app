import { Body, H3, List, ListItem, Right, Text, View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import variables from "../../theme/variables";

const unavailableAlert = () => Alert.alert(I18n.t("global.notImplemented"));

const styles = StyleSheet.create({
  notGrow: {
    flex: 0,
    marginLeft: variables.fontSizeBase
  }
});

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
      title={I18n.t("profile.main.screenTitle")}
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
          extendedSubTitle={true}
        />

        {/* Remove account */}
        <ListItemComponent
          title={I18n.t("profile.main.mainPrivacy.removeAccount.title")}
          subTitle={I18n.t(
            "profile.main.mainPrivacy.removeAccount.description"
          )}
          onPress={unavailableAlert}
          extendedSubTitle={true}
        />

        {/* Export your data */}
        <ListItemComponent
          title={I18n.t("profile.main.mainPrivacy.exportData.title")}
          subTitle={I18n.t("profile.main.mainPrivacy.exportData.description")}
          onPress={unavailableAlert}
          extendedSubTitle={true}
        />
      </List>
    </ScreenContent>
  </TopScreenComponent>
);
