import { isPNOptInMessage } from "../utils";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../analytics";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { useIOStore } from "../../../store/hooks";
import { CTAS } from "../../messages/types/MessageCTA";

export const usePNOptInMessage = (
  ctas: CTAS | undefined,
  serviceId: ServiceId
) => {
  // Use the store since `isPNOptInMessage` is not a selector but an utility
  // that uses a backend status configuration that is normally updated every
  // minute. We do not want to cause a re-rendering or recompute the value
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
