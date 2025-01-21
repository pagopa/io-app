import * as pot from "@pagopa/ts-commons/lib/pot";
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
import { idpayInitiativeDetailsSelector } from "../../details/store";

type PaymentFailureSupportModal = {
  startIdPaySupport: (startingRoute?: string) => void;
};

const useIdPaySupportModal = (): PaymentFailureSupportModal => {
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);
  const initiative = pot.toUndefined(initiativeDetailsPot);

  const dispatch = useIODispatch();

  const zendeskAssistanceLogAndStart = (startingRoute?: string) => {
    resetCustomFields();
    // attach the main zendesk category to the ticket
    addTicketCustomField(zendeskCategoryId, defaultIdPayCategory.value);

    dispatch(
      zendeskSupportStart({
        startingRoute: startingRoute ?? "n/a",
        assistanceForIdPay: true,
        assistanceForPayment: false,
        assistanceForCard: false,
        assistanceForFci: false
      })
    );
    dispatch(zendeskSelectedCategory(defaultIdPayCategory));
  };

  const startIdPaySupport = (startingRoute?: string) => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart(startingRoute);
        break;
    }
  };

  return {
    startIdPaySupport
  };
};

export { useIdPaySupportModal };
