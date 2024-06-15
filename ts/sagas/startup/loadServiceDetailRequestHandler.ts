import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { buffers, channel, Channel } from "redux-saga";
import { call, fork, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { totServiceFetchWorkers } from "../../config";
import { applicationChangeState } from "../../store/actions/application";
import { loadServiceDetail } from "../../features/services/details/store/actions/details";
import { loadServicesDetail } from "../../store/actions/services";
import { trackServiceDetailLoadingStatistics } from "../../utils/analytics";
import { handleServiceDetails } from "../../features/services/details/saga/handleServiceDetails";

/**
 * A generator that listen for loadServiceDetail.request from a channel and perform the
 * handling.
 *
 * @param requestsChannel The channel where to take the loadServiceDetail.request actions
 * @param getService API call to fetch the service detail
 */
function* handleServiceLoadRequest(
  requestsChannel: Channel<ActionType<typeof loadServiceDetail.request>>,
  getService: ReturnType<typeof BackendClient>["getService"]
) {
  // Infinite loop that wait and process loadServiceDetail requests from the channel
  while (true) {
    const action: ActionType<typeof loadServiceDetail.request> = yield* take(
      requestsChannel
    );
    yield* call(handleServiceDetails, getService, action);
  }
}

/**
 * create an event channel to buffer all services detail loading requests
 * it watches for loadServicesDetail (multiple services id) and for each of them, it puts a
 * loadServiceDetail.request event into that channel
 * The workers (the handlers) will consume the channel data
 * @param getService
 */
export function* watchServicesDetailLoadSaga(
  getService: ReturnType<typeof BackendClient>["getService"]
) {
  // start a saga to track services detail load stats
  yield* fork(watchLoadServicesDetailToTrack);

  // Create the channel used for the communication with the handlers.
  const requestsChannel = (yield* call(
    channel,
    buffers.expanding()
  )) as Channel<ActionType<typeof loadServiceDetail.request>>;

  // fork the handlers
  // eslint-disable-next-line
  for (let i = 0; i < totServiceFetchWorkers; i++) {
    yield* fork(handleServiceLoadRequest, requestsChannel, getService);
  }

  while (true) {
    // Take the loadServicesDetail action and for each service id
    // put back a loadServiceDetail.request in the channel
    // to be processed by the handlers.
    const action = yield* take(loadServicesDetail);

    action.payload.forEach((serviceId: string) =>
      requestsChannel.put(loadServiceDetail.request(serviceId))
    );
  }
}

const calculateLoadingTime = (startTime: Millisecond): Millisecond =>
  (startTime !== 0 ? new Date().getTime() - startTime : 0) as Millisecond;

/**
 * listen for loading services details events to extract some track information
 * like amount of details to load and how much time they take
 */
function* watchLoadServicesDetailToTrack() {
  yield* takeLatest(
    [loadServicesDetail, loadServiceDetail.success, applicationChangeState],
    action => {
      switch (action.type) {
        // request to load a set of services detail
        // copying object is needed to avoid "immutable" error on frozen objects
        case getType(loadServicesDetail):
          const stats: ServicesDetailLoadTrack = {
            ...servicesDetailLoadTrack,
            kind: undefined,
            startTime: new Date().getTime() as Millisecond,
            servicesId: new Set([...action.payload]),
            loaded: 0,
            toLoad: action.payload.length
          };
          servicesDetailLoadTrack = stats;
          break;
        // single service detail is been loaded
        case getType(loadServiceDetail.success):
          servicesDetailLoadTrack.servicesId.delete(action.payload.service_id);
          const statsServiceLoad: ServicesDetailLoadTrack = {
            ...servicesDetailLoadTrack,
            loaded:
              servicesDetailLoadTrack.toLoad -
              servicesDetailLoadTrack.servicesId.size
          };
          servicesDetailLoadTrack = statsServiceLoad;
          if (
            statsServiceLoad.servicesId.size === 0 &&
            statsServiceLoad.loaded > 0
          ) {
            // all service are been loaded
            trackServicesDetailLoad({
              ...servicesDetailLoadTrack,
              kind: "COMPLETE",
              loadingTime: calculateLoadingTime(
                servicesDetailLoadTrack.startTime
              )
            });
          }

          break;
        // app changes state
        case getType(applicationChangeState):
          /**
           * if the app went in inactive or background state these measurements
           * could be not valid since the OS could apply a freeze or a limitation around the app context
           * so the app could run but with few limitations
           */
          if (
            action.payload !== "active" &&
            servicesDetailLoadTrack.servicesId.size > 0
          ) {
            trackServicesDetailLoad({
              ...servicesDetailLoadTrack,
              loadingTime: calculateLoadingTime(
                servicesDetailLoadTrack.startTime
              ),
              kind: "PARTIAL"
            });
          }
          // app comes back active, restore stats
          else if (action.payload === "active") {
            servicesDetailLoadTrack = {
              ...servicesDetailLoadTrack,
              kind: undefined,
              startTime: new Date().getTime() as Millisecond,
              loaded: 0,
              toLoad: servicesDetailLoadTrack.servicesId.size
            };
          }
          break;
      }
    }
  );
}

export type ServicesDetailLoadTrack = {
  // when loading starts
  startTime: Millisecond;
  // the amount of loading millis
  loadingTime: Millisecond;
  // the amount of services detail to load
  toLoad: number;
  // the amount of services detail loaded
  loaded: number;
  // the set of the services id that remain to be loaded
  servicesId: Set<string>;
  // COMPLETE: all services detail are been loaded
  // PARTIAL: a sub-set of services detail to load are been loaded
  kind?: "COMPLETE" | "PARTIAL";
};

const defaultDetailLoadTrack = (): ServicesDetailLoadTrack => ({
  startTime: 0 as Millisecond,
  loadingTime: 0 as Millisecond,
  toLoad: 0,
  loaded: 0,
  servicesId: new Set<string>()
});

// eslint-disable-next-line functional/no-let
let servicesDetailLoadTrack = defaultDetailLoadTrack();

const trackServicesDetailLoad = (trackingStats: ServicesDetailLoadTrack) => {
  trackServiceDetailLoadingStatistics(trackingStats);
  // reset on complete
  // when it is "PARTIAL" data must be keep to be used when the app come active again
  if (trackingStats.kind === "COMPLETE") {
    // reset data
    servicesDetailLoadTrack = defaultDetailLoadTrack();
  }
};
