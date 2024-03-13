import { isPNOptInMessage } from "../../pn/utils";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../../pn/analytics";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { useIOStore } from "../../../store/hooks";
import { CTAS } from "../types/MessageCTA";

export const usePNOptInMessage = (
  ctas: CTAS | undefined,
  serviceId: ServiceId
) => {
  const store = useIOStore();
  const state = store.getState();
  const pnOptInMessageInfo = isPNOptInMessage(ctas, serviceId, state);

  useOnFirstRender(
    () => {
      trackPNOptInMessageOpened();
      trackPNOptInMessageCTADisplaySuccess();
    },
    () => pnOptInMessageInfo.isPNOptInMessage
  );

  return pnOptInMessageInfo;
};
