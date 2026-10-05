import { ToolEnum } from "@io-app/api-types/generated/definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "@io-app/api-types/generated/definitions/content/ZendeskCategory";
import { useRoute } from "@react-navigation/native";
import { useCallback } from "react";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  resetCustomFields,
  resetLog,
  zendeskCategoryId,
  zendeskItWalletCategory,
  zendeskItWalletFailureCode,
  zendeskItWalletSubcategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { itwZendeskCategorySelector } from "../store/selectors/zendesk";

export enum ZendeskSubcategoryValue {
  IT_WALLET_AGGIUNTA_DOCUMENTI = "it_wallet_aggiunta_documenti",
  IT_WALLET_PRESENTAZIONE_REMOTA = "it_wallet_presentazione_remota"
}

/**
 * Subcategory values of the IT-Wallet (L3) category. The legacy values belong
 * to the Documenti su IO category, which kept the `it_wallet` value.
 */
const itWalletSubcategoryValues: Record<ZendeskSubcategoryValue, string> = {
  [ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI]:
    "it_wallet2_aggiunta_documenti",
  [ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA]:
    "it_wallet2_presentazione_remota"
};

const getSubcategoryValue = (
  category: ZendeskCategory,
  subcategory: ZendeskSubcategoryValue
) =>
  category.value === zendeskItWalletCategory.value
    ? itWalletSubcategoryValues[subcategory]
    : subcategory;

export type ItwZendeskSupportParams = {
  /**
   * Overrides the category derived from the wallet status. Use it when the flow
   * itself determines the category, e.g. an IT-Wallet activation for a user
   * whose wallet is not active yet.
   */
  category?: ZendeskCategory;
  /** When provided, sets the `zendeskItWalletFailureCode` custom field. */
  errorCode?: string;
  /** When provided, appended to the Zendesk ticket log. */
  logData?: string;
  subcategory: ZendeskSubcategoryValue;
};

/**
 * Primitive hook that owns all IT Wallet–specific Zendesk ticket setup: tool
 * check, custom field population, and the two required dispatches.
 *
 * Use this as the single entry point for any IT Wallet support ticket flow to
 * ensure consistent metadata and prevent categorisation gaps.
 */
export const useItwZendeskSupport = () => {
  const dispatch = useIODispatch();
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const walletStatusCategory = useIOSelector(itwZendeskCategorySelector);
  const { name: startingRoute } = useRoute();

  const startItwZendeskSupport = useCallback(
    ({
      category = walletStatusCategory,
      subcategory,
      errorCode,
      logData
    }: ItwZendeskSupportParams) => {
      if (choosenTool !== ToolEnum.zendesk) {
        return;
      }

      resetCustomFields();
      resetLog();

      addTicketCustomField(zendeskCategoryId, category.value);
      addTicketCustomField(
        zendeskItWalletSubcategoryId,
        getSubcategoryValue(category, subcategory)
      );

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
      dispatch(zendeskSelectedCategory(category));
    },
    [choosenTool, dispatch, startingRoute, walletStatusCategory]
  );

  return { startItwZendeskSupport };
};
