/**
 * A screen to show the app Terms of Service.
 * This screen is used as Privacy screen From Profile section.
 */
import * as React from "react";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import TosWebviewComponent from "../../components/TosWebviewComponent";
import { privacyUrl } from "../../config";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { getFlowType } from "../../utils/analytics";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { trackTosScreen } from "./analytics";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
const TosScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const flow = getFlowType(false, false);

  useOnFirstRender(() => {
    trackTosScreen(flow);
  });

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleReload = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    faqCategories: ["privacy"]
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <SafeAreaView edges={["bottom"]} style={IOStyles.flex}>
        <TosWebviewComponent
          flow={flow}
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
