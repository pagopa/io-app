/**
 * tracking state hold all stuffs useful tp keep track of events or make measurements
 */
import { Millisecond } from "italia-ts-commons/lib/units";
import { getType } from "typesafe-actions";
import { Action } from "../actions/types";
import { loadServiceDetail, loadServicesDetail } from "../actions/services";
import { GlobalState } from "./types";

type ServicesTracking = {
  servicesDetailLoadingStart: Millisecond;
  servicesDetailsId: ReadonlyArray<string>;
};

export type TrackingState = {
  services: ServicesTracking | undefined;
};

const INITIAL_STATE: TrackingState = {
  services: undefined
};

const reducer = (
  state: TrackingState = INITIAL_STATE,
  action: Action
): TrackingState => state;

export const servicesDetailLoadingStartSelector = (
  state: GlobalState
): Millisecond | undefined =>
  state.tracking.services?.servicesDetailLoadingStart;

export const isLoadingServicesDetailCompleted = (state: GlobalState): boolean =>
  state.tracking.services?.servicesDetailsId.length === 0;

export default reducer;
