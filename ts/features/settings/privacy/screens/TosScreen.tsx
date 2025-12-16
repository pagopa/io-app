/**
 * A screen to show the app Terms of Service.
 * This screen is used as Privacy screen From Profile section.
 */
import { ContentWrapper, H2 } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useState } from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { getFlowType } from "../../../../utils/analytics";
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { tosConfigSelector } from "../../../tos/store/selectors";
import { trackTosScreen } from "../shared/analytics";
import TosWebviewComponent from "../shared/components/TosWebviewComponent";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.privacy.privacyPolicy.contextualHelpTitlePolicy",
  body: "profile.main.privacy.privacyPolicy.contextualHelpContentPolicy"
};

/**
 * A screen to show the ToS to the user.
 */
const TosScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  const tosConfig = useIOSelector(tosConfigSelector);
  const privacyUrl = tosConfig.tos_url;

  const flow = getFlowType(false, false);

  useOnFirstRender(() => {
    trackTosScreen(flow);
  });
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleReload = () => {
    setIsLoading(true);
  };

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelpMarkdown,
    faqCategories: ["privacy"]
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <ContentWrapper>
        <H2
          accessible={true}
          accessibilityRole="header"
          testID="screen-content-header-title"
        >
          {I18n.t("profile.main.privacy.privacyPolicy.title")}
        </H2>
      </ContentWrapper>
      <TosWebviewComponent
        flow={flow}
        handleLoadEnd={handleLoadEnd}
        handleReload={handleReload}
        webViewSource={{ uri: privacyUrl }}
        shouldRenderFooter={false}
      />
    </LoadingSpinnerOverlay>
  );
};

export default TosScreen;
