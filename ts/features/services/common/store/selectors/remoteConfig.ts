import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isMinAppVersionSupported } from "../../../../../store/reducers/featureFlagWithMinAppVersionStatus";
import { GlobalState } from "../../../../../store/reducers/types";

const servicesConfigSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.chainNullableK(config => config.services)
  );

export const isFavouriteServicesEnabledSelector = (state: GlobalState) =>
  pipe(
    state,
    servicesConfigSelector,
    O.chainNullableK(services => services.favouriteServices),
    isMinAppVersionSupported
  );

export const favouriteServicesLimitSelector = (state: GlobalState) =>
  pipe(
    state,
    servicesConfigSelector,
    O.chainNullableK(services => services.favouriteServices),
    O.chainNullableK(favouriteServices => favouriteServices.limit),
    O.getOrElse(() => 20)
  );
