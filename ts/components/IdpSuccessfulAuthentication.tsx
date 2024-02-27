/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StyleSheet } from "react-native";

import { H3, IOStyles, Pictogram } from "@pagopa/io-app-design-system";
import { profileNameSelector } from "../store/reducers/profile";
import I18n from "../i18n";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import { trackIdpAuthenticationSuccessScreen } from "../screens/profile/analytics";
import { useIOSelector } from "../store/hooks";
import { loggedInIdpSelector } from "../store/reducers/authentication";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  }
});

export const IdpSuccessfulAuthentication = () => {
  const idp = useIOSelector(loggedInIdpSelector);
  useOnFirstRender(() => {
    trackIdpAuthenticationSuccessScreen(idp?.id);
  });
  const name = useIOSelector(profileNameSelector);
  const contentTitle = I18n.t("authentication.idp_login_success.contentTitle", {
    name
  });
  return (
    <View style={styles.container}>
      <Pictogram name="success" size={180} />
      {name && <H3 accessibilityLabel={contentTitle}>{contentTitle}</H3>}
    </View>
  );
};
