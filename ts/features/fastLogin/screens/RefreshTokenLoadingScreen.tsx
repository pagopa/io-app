import * as React from "react";
import { Modal, View, StyleSheet } from "react-native";
import {
  ContentWrapper,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import { LoadingIndicator } from "../../../components/ui/LoadingIndicator";

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

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

const RefreshTokenLoadingScreen = () => {
  useAvoidHardwareBackButton();

  const contentTitle = I18n.t("fastLogin.loadingScreen.title");

  return (
    <Modal>
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
            <H3 style={styles.contentTitle} accessibilityLabel={contentTitle}>
              {contentTitle}
            </H3>
          </View>
        </ContentWrapper>
      </SafeAreaView>
    </Modal>
  );
};
export default RefreshTokenLoadingScreen;
