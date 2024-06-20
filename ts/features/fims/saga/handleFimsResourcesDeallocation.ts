import { call, select } from "typed-redux-saga/macro";
import {
  deallocate,
  removeAllCookiesForDomain
} from "@pagopa/io-react-native-http-client";
import { StackActions } from "@react-navigation/native";
import { fimsDomainSelector } from "../../../store/reducers/backendStatus";
import NavigationService from "../../../navigation/NavigationService";

export function* handleFimsResourcesDeallocation() {
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  if (oidcProviderUrl) {
    yield* call(removeAllCookiesForDomain, oidcProviderUrl);
  }
  yield* call(deallocate);
  yield* call(NavigationService.dispatchNavigationAction, StackActions.pop());
}
