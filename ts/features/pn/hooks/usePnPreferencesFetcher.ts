import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { loadServicePreference } from "../../services/details/store/actions/preference";
import { servicePreferencePotSelector } from "../../services/details/store/reducers";
import {
  ServicePreferenceResponse,
  isServicePreferenceResponseSuccess
} from "../../services/details/types/ServicePreferenceResponse";

type PnStatus = {
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
};

export const usePnPreferencesFetcher = (pnServiceId: ServiceId): PnStatus => {
  const dispatch = useIODispatch();
  const servicePreferencePot = useIOSelector(state =>
    servicePreferencePotSelector(state)
  );
  const isCorrectId = pipe(
    pot.map(
      servicePreferencePot,
      (preference: ServicePreferenceResponse) => preference.id === pnServiceId
    ),
    res => pot.getOrElse(res, false)
  );

  // redux always contains data based on the last loaded service,
  // so to avoid displaying incorrect data, we have to forcefully lock down the component
  // until the correct service is loaded
  useEffect(() => {
    if (!isCorrectId) {
      dispatch(loadServicePreference.request(pnServiceId));
    }
  }, [pnServiceId, dispatch, isCorrectId]);

  if (!isCorrectId) {
    return {
      isLoading: true,
      isError: false,
      isEnabled: false
    };
  }
  return {
    isLoading: pot.isLoading(servicePreferencePot),
    isError: pot.isError(servicePreferencePot),
    isEnabled: pipe(
      servicePreferencePot,
      pot.toOption,
      O.filter(isServicePreferenceResponseSuccess),
      O.map(preference => preference.value.inbox),
      O.getOrElse(() => false)
    )
  };
};
