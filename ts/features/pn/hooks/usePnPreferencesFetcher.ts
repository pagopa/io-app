import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { loadServicePreference } from "../../services/details/store/actions/preference";
import { servicePreferencePotByIdSelector } from "../../services/details/store/selectors";
import { isServicePreferenceResponseSuccess } from "../../services/details/types/ServicePreferenceResponse";

type PnStatus = {
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
};

export const usePnPreferencesFetcher = (pnServiceId: ServiceId): PnStatus => {
  const [hasFetched, setHasFetched] = React.useState<boolean>(false);
  const dispatch = useIODispatch();
  const servicePreferencePot = useIOSelector(state =>
    servicePreferencePotByIdSelector(state, pnServiceId)
  );

  const isError = pot.isError(servicePreferencePot);

  useOnFirstRender(() => {
    dispatch(loadServicePreference.request(pnServiceId));
    setHasFetched(true);
  });

  // to avoid displaying incorrect data, we have to forcefully lock down the component
  // until the correct service is loaded
  if (!hasFetched) {
    return {
      isLoading: true,
      isError: false,
      isEnabled: false
    };
  }
  return {
    isLoading: pot.isLoading(servicePreferencePot),
    isError,
    isEnabled: pipe(
      servicePreferencePot,
      pot.toOption,
      O.filter(isServicePreferenceResponseSuccess),
      O.map(preference => preference.value.inbox),
      O.getOrElse(() => false)
    )
  };
};
