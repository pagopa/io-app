import {
  deallocate,
  removeAllCookiesForDomain
} from "@pagopa/io-react-native-http-client";
import { StackActions } from "@react-navigation/native";
import { call, put, select } from "typed-redux-saga/macro";
import NavigationService from "../../../../navigation/NavigationService";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { fimsRelyingPartyDomainSelector } from "../store/selectors";

export function* handleFimsResourcesDeallocation() {
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const rpDomain = yield* select(fimsRelyingPartyDomainSelector);
  if (oidcProviderUrl) {
    yield* call(removeAllCookiesForDomain, oidcProviderUrl);
  }
  if (rpDomain) {
    yield* call(removeAllCookiesForDomain, rpDomain);
  }
  yield* call(deallocate);
}

export function* deallocateFimsAndRenewFastLoginSession() {
  yield* call(handleFimsResourcesDeallocation);
  yield* put(
    refreshSessionToken.request({
      showIdentificationModalAtStartup: false,
      showLoader: true,
      withUserInteraction: true
    })
  );
}

export function* deallocateFimsResourcesAndNavigateBack() {
  yield* call(handleFimsResourcesDeallocation);
  yield* call(NavigationService.dispatchNavigationAction, StackActions.pop());
}
