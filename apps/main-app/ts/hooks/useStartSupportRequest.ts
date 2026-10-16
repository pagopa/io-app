import { ToolEnum } from "@io-app/api-types/generated/definitions/content/AssistanceToolConfig";
import { useRoute } from "@react-navigation/native";
import { useCallback } from "react";

import { zendeskSupportStart } from "../features/zendesk/store/actions";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { assistanceToolConfigSelector } from "../store/reducers/backendStatus/remoteConfig";
import {
  assistanceToolRemoteConfig,
  resetCustomFields
} from "../utils/supportAssistance";

export const useStartSupportRequest = () => {
  const { name: currentScreenName } = useRoute();

  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  return useCallback((): void => {
    switch (choosenTool) {
      case ToolEnum.instabug:
      case ToolEnum.none:
      case ToolEnum.web:
        return;
      case ToolEnum.zendesk:
        // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
        resetCustomFields();
        dispatch(
          zendeskSupportStart({
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
    }
  }, [currentScreenName, dispatch, choosenTool]);
};
