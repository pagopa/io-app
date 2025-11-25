import { useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import { ToolEnum } from "../../definitions/content/AssistanceToolConfig";

import { zendeskSupportStart } from "../features/zendesk/store/actions";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { assistanceToolConfigSelector } from "../store/reducers/backendStatus/remoteConfig";
import { FAQsCategoriesType } from "../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../utils/help";
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
  const { name: currentScreenName } = useRoute();

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
            assistanceType: {
              payment: false,
              card: false,
              fci: false,
              itWallet: false,
              idPay: false
            }
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
