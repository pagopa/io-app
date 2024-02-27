/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";

import {
  ContentWrapper,
  H3,
  IOStyles,
  Pictogram
} from "@pagopa/io-app-design-system";
import { profileNameSelector } from "../store/reducers/profile";
import I18n from "../i18n";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import { trackIdpAuthenticationSuccessScreen } from "../screens/profile/analytics";
import { useIOSelector } from "../store/hooks";
import { loggedInIdpSelector } from "../store/reducers/authentication";

const styles = StyleSheet.create({
  container: {
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
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={{ alignItems: "center" }}>
          <Pictogram name="success" size={180} />
          {name && (
            <H3
              style={{ textAlign: "center" }}
              accessibilityLabel={contentTitle}
            >
              {contentTitle}
            </H3>
          )}
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
