import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { MarkdownScreenComponent } from "../../components/screens/MarkdownScreenComponent";

import { H2 } from "native-base";
import I18n from "../../i18n";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

/**
 * A screen to show the Privacy policy to the user.
 */
export const PrivacyScreen: React.SFC<Props> = props => (
  <React.Fragment>
    <MarkdownScreenComponent
      goBack={() => props.navigation.goBack()}
      markdown={I18n.t("profile.main.privacy.text")}
      headerTitle={I18n.t("profile.main.mainPrivacy.screenTitle")}
      headerContent={<H2>{I18n.t("profile.main.privacy.header")}</H2>}
    />
  </React.Fragment>
);
