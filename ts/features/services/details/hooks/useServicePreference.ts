import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOSelector } from "../../../../store/hooks";
import { EnabledChannels } from "../../../../utils/profile";
import { servicePreferenceByChannelPotSelector } from "../store/selectors";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

/**
 * Hook to get the service preference by channel
 */
export const useServicePreferenceByChannel = (
  channel: keyof EnabledChannels,
  serviceId: ServiceId | undefined
) => {
  const servicePreferenceByChannelPot = useIOSelector(state =>
    servicePreferenceByChannelPotSelector(state, serviceId, channel)
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
