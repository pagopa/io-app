import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";

import { applicationChangeState } from "../../../../../store/actions/application";
import * as USEIO from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import * as SID_SELECTOR from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as PREFERENCES_FETCHER from "../../../hooks/usePnPreferencesFetcher";
import PN_ROUTES from "../../../navigation/routes";
import { pnActivationUpsert } from "../../../store/actions";
import * as LOADING_PN_ACTIVATION from "../../../store/reducers/activation";
import {
  PNActivationBannerFlowScreen,
  pnBannerFlowStateEnum
} from "../PnReminderBannerFlow";

jest.mock("../../../analytics/activationReminderBanner", () => {
  const actual = jest.requireActual(
    "../../../analytics/activationReminderBanner"
  );
  return {
    sendBannerMixpanelEvents: {
      ...actual.sendBannerMixpanelEvents,
      activationStart: jest.fn()
    }
  };
});

describe("error screens", () => {
  beforeEach(() => {
    jest
      .spyOn(LOADING_PN_ACTIVATION, "isLoadingPnActivationSelector")
      .mockImplementation(() => false);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  for (const error of ["missing_sid", "preferences"] as const) {
    it(`should display an error screen in case of ${error} error`, () => {
      const mockDispatch = jest.fn();
      jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => mockDispatch);
      jest
        .spyOn(SID_SELECTOR, "pnMessagingServiceIdSelector")
        .mockImplementation(() =>
          error === "missing_sid" ? undefined : ("SOME_SID" as ServiceId)
        );
      jest
        .spyOn(PREFERENCES_FETCHER, "usePnPreferencesFetcher")
        .mockImplementation(() => ({
          isError: error === "preferences",
          isLoading: false,
          isEnabled: false
        }));
      const component = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();
      switch (error) {
        case "missing_sid":
          expect(component.getByTestId(`error-MISSING-SID`)).toBeDefined();
          break;
        case "preferences":
          expect(
            component.getByTestId(
              `error-${pnBannerFlowStateEnum.FAILURE_DETAILS_FETCH}`
            )
          ).toBeDefined();
          break;
      }
    });
  }
});

describe("loading screens + error interop", () => {
  beforeEach(() => {
    jest
      .spyOn(SID_SELECTOR, "pnMessagingServiceIdSelector")
      .mockImplementation(() => "SOME_SID" as ServiceId);
    jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => jest.fn());
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  for (const loadingState of ["activation", "data", "both"] as const) {
    // handles loading states
    for (const isPreferenceError of [true, false]) {
      it(`should render the correct loading screen when there is a "${loadingState}" loadingState, and there ${
        isPreferenceError ? "is" : "isn't"
      } a preference error `, () => {
        jest
          .spyOn(LOADING_PN_ACTIVATION, "isLoadingPnActivationSelector")
          .mockImplementation(
            () => loadingState === "activation" || loadingState === "both"
          );
        jest
          .spyOn(PREFERENCES_FETCHER, "usePnPreferencesFetcher")
          .mockImplementation(() => ({
            isError: isPreferenceError,
            isLoading: loadingState === "data" || loadingState === "both",
            isEnabled: false
          }));

        const component = renderComponent();
        expect(component.toJSON()).toMatchSnapshot();
        switch (loadingState) {
          case "activation":
            // activation requires the preferences to not be in error.
            expect(
              component.getByTestId(
                isPreferenceError
                  ? "error-FAILURE_DETAILS_FETCH"
                  : "loading-LOADING-ACTIVATION"
              )
            ).toBeDefined();
            break;
          case "both":
            expect(component.getByTestId(`loading-LOADING-DATA`)).toBeDefined();
            break;
          case "data":
            expect(component.getByTestId(`loading-LOADING-DATA`)).toBeDefined();
            break;
        }
      });
    }
  }
});

function* mockSaga(sagaSuccess: boolean) {
  yield* takeLatest(
    pnActivationUpsert.request,
    function* secondMock(
      action: ActionType<typeof pnActivationUpsert.request>
    ) {
      if (sagaSuccess) {
        action.payload.onSuccess?.();
        yield* put(pnActivationUpsert.success());
      } else {
        action.payload.onFailure?.();

        yield* put(pnActivationUpsert.failure());
      }
    }
  );
}

const renderComponent = (sagaSuccess = true) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const saga = createSagaMiddleware();
  const store = createStore(
    appReducer,
    initialState as any,
    applyMiddleware(saga)
  );
  saga.run(mockSaga, sagaSuccess);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    PNActivationBannerFlowScreen,
    PN_ROUTES.ACTIVATION_BANNER_FLOW,
    {},
    store
  );
};
