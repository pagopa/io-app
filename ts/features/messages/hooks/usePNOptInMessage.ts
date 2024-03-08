import { isPNOptInMessage } from "../../pn/utils";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  trackPNOptInMessageCTADisplaySuccess,
  trackPNOptInMessageOpened
} from "../../pn/analytics";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { useIOStore } from "../../../store/hooks";

export const usePNOptInMessage = (serviceId: ServiceId) => {
  const store = useIOStore();
  const state = store.getState();
  const isPNOptIn = isPNOptInMessage(serviceId, state);

  useOnFirstRender(
    () => {
      trackPNOptInMessageOpened();
      trackPNOptInMessageCTADisplaySuccess();
    },
    () => isPNOptIn
  );

  return {
    isPNOptIn
  };
};
