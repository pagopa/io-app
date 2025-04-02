/**
 * A screen to show the app Terms of Service.
 * This screen is used as Privacy screen From Profile section.
 */
import { useState } from "react";
import { H2, IOStyles } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import TosWebviewComponent from "../shared/components/TosWebviewComponent";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { getFlowType } from "../../../../utils/analytics";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { tosConfigSelector } from "../../../tos/store/selectors";
import { trackTosScreen } from "../../common/analytics";

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
      <View style={IOStyles.horizontalContentPadding}>
        <H2
          accessible={true}
          accessibilityRole="header"
          testID="screen-content-header-title"
        >
          {I18n.t("profile.main.privacy.privacyPolicy.title")}
        </H2>
      </View>
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
