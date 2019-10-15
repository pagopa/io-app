import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { MarkdownScreenComponent } from "../../components/screens/MarkdownScreenComponent";

import H4 from "../../components/ui/H4";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  bolded: {
    fontWeight: customVariables.textBoldWeight
  }
});

const contextualHelp = {
  title: I18n.t("profile.main.privacy.contextualHelpTitlePolicy"),
  body: () => (
    <Markdown>{I18n.t("profile.main.privacy.contextualHelpContentPolicy")}</Markdown>
  )
};
/**
 * A screen to show the Privacy policy to the user.
 */
export const PrivacyScreen: React.SFC<Props> = props => (
  <React.Fragment>
    <MarkdownScreenComponent
      goBack={() => props.navigation.goBack()}
      markdown={I18n.t("profile.main.privacy.text")}
      headerTitle={I18n.t("profile.main.mainPrivacy.screenTitle")}
      headerContent={
        <H4 style={styles.bolded}>{I18n.t("profile.main.privacy.header")}</H4>
      }
      contextualHelp={contextualHelp}
    />
  </React.Fragment>
);
