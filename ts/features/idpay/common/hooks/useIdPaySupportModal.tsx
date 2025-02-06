import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  defaultIdPayCategory,
  resetCustomFields,
  zendeskCategoryId
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
    addTicketCustomField(zendeskCategoryId, defaultIdPayCategory.value);

    dispatch(
      zendeskSupportStart({
        startingRoute: startingRoute ?? "n/a",
        assistanceType: {
          idPay: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(defaultIdPayCategory));
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
