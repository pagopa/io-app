import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  defaultIdPayExpenseCategory,
  resetCustomFields,
  zendeskIdPayCategoryId
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";

type PaymentFailureSupportModal = {
  startIdPaySupport: (startingRoute?: string) => void;
};

const useIdPaySupportModal = (): PaymentFailureSupportModal => {
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const dispatch = useIODispatch();

  const zendeskAssistanceLogAndStart = (startingRoute?: string) => {
    resetCustomFields();
    // attach the main zendesk category to the ticket
    addTicketCustomField(
      zendeskIdPayCategoryId,
      defaultIdPayExpenseCategory.value
    );

    dispatch(
      zendeskSupportStart({
        startingRoute: startingRoute ?? "n/a",
        assistanceType: {
          idPay: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(defaultIdPayExpenseCategory));
  };

  const startIdPaySupport = (startingRoute?: string) => {
    if (choosenTool === ToolEnum.zendesk) {
      zendeskAssistanceLogAndStart(startingRoute);
    }
  };

  return {
    startIdPaySupport
  };
};

export { useIdPaySupportModal };
