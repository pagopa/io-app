import { useCallback } from "react";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../components/screens/BaseScreenComponent";
import { zendeskSupportStart } from "../features/zendesk/store/actions";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { assistanceToolConfigSelector } from "../store/reducers/backendStatus";
import { currentRouteSelector } from "../store/reducers/navigation";
import { FAQsCategoriesType } from "../utils/faq";
import {
  assistanceToolRemoteConfig,
  resetCustomFields
} from "../utils/supportAssistance";

export interface SupportRequestParams {
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
}

export const useStartSupportRequest = ({
  faqCategories,
  contextualHelp,
  contextualHelpMarkdown
}: SupportRequestParams) => {
  /**
   *  We have to use the deprecated currentRouteSelector because, at the moment, some components are rendered outside the navigation context.
   *  TODO: Full usage of navigation header and modal, in order to have always the right context
   */
  const currentScreenName = useIOSelector(currentRouteSelector);

  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  return useCallback((): void => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
        resetCustomFields();
        dispatch(
          zendeskSupportStart({
            faqCategories,
            contextualHelp,
            contextualHelpMarkdown,
            startingRoute: currentScreenName,
            assistanceForPayment: false,
            assistanceForCard: false,
            assistanceForFci: false
          })
        );
        return;
      case ToolEnum.instabug:
      case ToolEnum.web:
      case ToolEnum.none:
        return;
    }
  }, [
    faqCategories,
    contextualHelp,
    contextualHelpMarkdown,
    currentScreenName,
    dispatch,
    choosenTool
  ]);
};
