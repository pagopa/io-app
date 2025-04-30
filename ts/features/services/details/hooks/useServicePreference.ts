import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOSelector } from "../../../../store/hooks";
import { servicePreferenceByChannelPotSelector } from "../store/reducers";
import { EnabledChannels } from "../../../../utils/profile";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

/**
 * Hook to get the service preference by channel
 */
export const useServicePreferenceByChannel = (
  channel: keyof EnabledChannels,
  serviceId: ServiceId | undefined
) => {
  const servicePreferenceByChannelPot = useIOSelector(state =>
    servicePreferenceByChannelPotSelector(state, channel)(serviceId)
  );

  const servicePreferenceByChannel = pot.toUndefined(
    servicePreferenceByChannelPot
  );

  const isErrorServicePreferenceByChannel = pot.isError(
    servicePreferenceByChannelPot
  );

  const isLoadingServicePreferenceByChannel = pot.isLoading(
    servicePreferenceByChannelPot
  );

  return {
    isErrorServicePreferenceByChannel,
    isLoadingServicePreferenceByChannel,
    servicePreferenceByChannel
  };
};
