import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { MarkdownScreenComponent } from "../../components/screens/MarkdownScreenComponent";

import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import H4 from "../../components/ui/H4";
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

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the Privacy policy to the user.
 */
export const PrivacyScreen: React.SFC<Props> = props => (
  <React.Fragment>
    <MarkdownScreenComponent
      goBack={() => props.navigation.goBack()}
      markdown={I18n.t("profile.main.privacy.privacyPolicy.text")}
      headerTitle={I18n.t("profile.main.privacy.privacyPolicy.title")}
      headerContent={
        <H4 style={styles.bolded}>
          {I18n.t("profile.main.privacy.privacyPolicy.header")}
        </H4>
      }
      contextualHelpMarkdown={contextualHelpMarkdown}
    />
  </React.Fragment>
);
