import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { MarkdownScreenComponent } from "../../components/screens/MarkdownScreenComponent";

import I18n from "../../i18n";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

/**
 * A screen to show the Privacy policy to the user.
 */
export const PrivacyScreen: React.SFC<Props> = props => (
  <MarkdownScreenComponent
    goBack={() => props.navigation.goBack()}
    markdown={I18n.t("profile.main.privacy.text")}
    headerTitle={I18n.t("profile.main.mainPrivacy.screenTitle")}
  />
);
