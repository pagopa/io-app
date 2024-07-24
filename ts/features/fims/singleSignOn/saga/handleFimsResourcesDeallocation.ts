import { call, select } from "typed-redux-saga/macro";
import {
  deallocate,
  removeAllCookiesForDomain
} from "@pagopa/io-react-native-http-client";
import { StackActions } from "@react-navigation/native";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import NavigationService from "../../../../navigation/NavigationService";
import { fimsRelyingPartyDomainSelector } from "../store/reducers";

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
  yield* call(NavigationService.dispatchNavigationAction, StackActions.pop());
}
