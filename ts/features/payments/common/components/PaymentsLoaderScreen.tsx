import {
  ContentWrapper,
  H3,
  IOStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import I18n from "../../../../i18n";

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

const PaymentsLoaderScreen = () => {
  const theme = useIOTheme();

  React.useEffect(() => {
    // Since the screen is shown for a very short time,
    // we prefer to announce the content to the screen reader,
    // instead of focusing the first element.
    if (Platform.OS === "android") {
      // We use it only on Android, because on iOS the screen reader
      // stops reading the content when the ingress screen is unmounted
      // and the focus is moved to another element.
      AccessibilityInfo.announceForAccessibility(
        I18n.t("global.remoteStates.wait")
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ContentWrapper>
        <View style={styles.content}>
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            <LoadingIndicator />
          </View>
          <VSpacer size={SPACE_BETWEEN_SPINNER_AND_TEXT} />
          <H3
            color={theme["textHeading-secondary"]}
            style={styles.contentTitle}
            accessibilityLabel={I18n.t("global.remoteStates.wait")}
          >
            {I18n.t("global.remoteStates.wait")}
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  },
  contentTitle: {
    textAlign: "center"
  },
  content: {
    alignItems: "center"
  }
});

export default PaymentsLoaderScreen;
