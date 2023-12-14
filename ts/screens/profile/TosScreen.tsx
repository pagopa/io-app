/**
 * A screen to show the app Terms of Service.
 * This screen is used as Privacy screen From Profile section.
 */
import * as React from "react";
import { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import TosWebviewComponent from "../../components/TosWebviewComponent";
import { privacyUrl } from "../../config";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { getFlowType } from "../../utils/analytics";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { trackTosScreen } from "./analytics";

const styles = StyleSheet.create({
  webViewContainer: {
    flex: 1
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
const TosScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  useHeaderSecondLevel({
    title: I18n.t("profile.main.privacy.privacyPolicy.title"),
    supportRequest: true,
    contextualHelpMarkdown,
    faqCategories: ["privacy"]
  });

  useOnFirstRender(() => {
    trackTosScreen(getFlowType(false, false));
  });

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleReload = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <SafeAreaView style={styles.webViewContainer}>
        <TosWebviewComponent
          handleLoadEnd={handleLoadEnd}
          handleReload={handleReload}
          webViewSource={{ uri: privacyUrl }}
          shouldRenderFooter={false}
        />
      </SafeAreaView>
    </LoadingSpinnerOverlay>
  );
};

export default TosScreen;
