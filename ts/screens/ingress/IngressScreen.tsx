/**
 * A component to display a white tick on a blue background
 */
import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  LoadingSpinner,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../i18n";

const styles = StyleSheet.create({
  container: {
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  }
});

export const IngressScreen = () => {
  const contentTitle = I18n.t("startup.title");
  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={{ alignItems: "center" }}>
          <LoadingSpinner size={48} />
          <VSpacer size={24} />
          <H3 style={{ textAlign: "center" }} accessibilityLabel={contentTitle}>
            {contentTitle}
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
