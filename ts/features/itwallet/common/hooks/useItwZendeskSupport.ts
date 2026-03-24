import { useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  assistanceToolRemoteConfig,
  resetCustomFields,
  resetLog,
  addTicketCustomField,
  appendLog,
  zendeskCategoryId,
  zendeskItWalletCategory,
  zendeskItWalletSubcategoryId,
  zendeskItWalletFailureCode
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";

export enum ZendeskSubcategoryValue {
  IT_WALLET_PRESENTAZIONE_REMOTA = "it_wallet_presentazione_remota",
  IT_WALLET_AGGIUNTA_DOCUMENTI = "it_wallet_aggiunta_documenti"
}

export type ItwZendeskSupportParams = {
  subcategory: ZendeskSubcategoryValue;
  /** When provided, sets the `zendeskItWalletFailureCode` custom field. */
  errorCode?: string;
  /** When provided, appended to the Zendesk ticket log. */
  logData?: string;
};

/**
 * Primitive hook that owns all IT Wallet–specific Zendesk ticket setup:
 * tool check, custom field population, and the two required dispatches.
 *
 * Use this as the single entry point for any IT Wallet support ticket flow
 * to ensure consistent metadata and prevent categorisation gaps.
 */
export const useItwZendeskSupport = () => {
  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const { name: startingRoute } = useRoute();

  const startItwZendeskSupport = useCallback(
    ({ subcategory, errorCode, logData }: ItwZendeskSupportParams) => {
      if (choosenTool !== ToolEnum.zendesk) {
        return;
      }

      resetCustomFields();
      resetLog();

      addTicketCustomField(zendeskCategoryId, zendeskItWalletCategory.value);
      addTicketCustomField(zendeskItWalletSubcategoryId, subcategory);

      if (errorCode) {
        addTicketCustomField(zendeskItWalletFailureCode, errorCode);
      }
      if (logData) {
        appendLog(logData);
      }

      dispatch(
        zendeskSupportStart({
          startingRoute,
          assistanceType: {
            itWallet: true
          }
        })
      );
      dispatch(zendeskSelectedCategory(zendeskItWalletCategory));
    },
    [choosenTool, dispatch, startingRoute]
  );

  return { startItwZendeskSupport };
};
