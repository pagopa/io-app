import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { put, takeLatest } from "typed-redux-saga";
import { ActionType } from "typesafe-actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import * as USEIO from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import * as SID_SELECTOR from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as PREF_BY_CHANNEL from "../../../services/details/hooks/useServicePreference";
import PN_ROUTES from "../../navigation/routes";
import { pnActivationUpsert } from "../../store/actions";
import * as LOADING_PN_ACTIVATION from "../../store/reducers/activation";
import {
  PNActivationBannerFlowScreen,
  pnBannerFlowStateEnum
} from "../PnReminderBannerFlow";

const WAITING_USER_INPUT_BASE_MOCKS = () => {
  jest
    .spyOn(SID_SELECTOR, "pnMessageServiceIdSelector")
    .mockImplementation(() => "SOME_SID" as ServiceId);
  jest
    .spyOn(LOADING_PN_ACTIVATION, "isLoadingPnActivationSelector")
    .mockImplementation(() => false);
  jest
    .spyOn(PREF_BY_CHANNEL, "useServicePreferenceByChannel")
    .mockImplementation(() => ({
      isErrorServicePreferenceByChannel: false,
      isLoadingServicePreferenceByChannel: false,
      servicePreferenceByChannel: false
    }));
};

describe("PnActivationReminderBannerFlow", () => {
  beforeEach(() => {
    WAITING_USER_INPUT_BASE_MOCKS();
    jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => jest.fn());
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  for (const [_key, val] of Object.entries(pnBannerFlowStateEnum)) {
    // handles flow-induced screens
    it(`should match snapshot for state= ${val}`, () => {
      jest.spyOn(React, "useState").mockImplementation(() => [val, () => null]);
      const component = renderComponent();
      expect(component.toJSON()).toMatchSnapshot();

      switch (val) {
        case "FAILURE_DETAILS_FETCH":
        case "FAILURE_ACTIVATION":
          expect(component.getByTestId(`error-${val}`)).toBeDefined();
          break;
        case "WAITING_USER_INPUT":
          expect(component.getByTestId(`cta-${val}`)).toBeDefined();
          break;
        case "SUCCESS_ACTIVATION":
        case "ALREADY_ACTIVE":
          expect(component.getByTestId(`success-${val}`)).toBeDefined();
          break;
      }
    });
  }
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
        .spyOn(SID_SELECTOR, "pnMessageServiceIdSelector")
        .mockImplementation(() =>
          error === "missing_sid" ? undefined : ("SOME_SID" as ServiceId)
        );
      jest
        .spyOn(PREF_BY_CHANNEL, "useServicePreferenceByChannel")
        .mockImplementation(() => ({
          isErrorServicePreferenceByChannel: error === "preferences",
          isLoadingServicePreferenceByChannel: false,
          servicePreferenceByChannel: false
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

// eslint-disable-next-line sonarjs/cognitive-complexity
describe("loading screens + error interop", () => {
  beforeEach(() => {
    jest
      .spyOn(SID_SELECTOR, "pnMessageServiceIdSelector")
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
          .spyOn(PREF_BY_CHANNEL, "useServicePreferenceByChannel")
          .mockImplementation(() => ({
            isErrorServicePreferenceByChannel: isPreferenceError,
            isLoadingServicePreferenceByChannel:
              loadingState === "data" || loadingState === "both",
            servicePreferenceByChannel: false
          }));

        const component = renderComponent();
        expect(component.toJSON()).toMatchSnapshot();
        switch (loadingState) {
          case "both":
            expect(component.getByTestId(`loading-LOADING-DATA`)).toBeDefined();
            break;
          case "data":
            expect(component.getByTestId(`loading-LOADING-DATA`)).toBeDefined();
            break;
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
        }
      });
    }
  }
});

describe("activation input screen", () => {
  beforeEach(() => {
    WAITING_USER_INPUT_BASE_MOCKS();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  for (const result of ["success", "error"] as const) {
    it(`should dispatch an upsert request on cta click, and correctly deliver a ${result} result. should then show the correct result screen`, () => {
      const mockSetState = jest.fn();

      const useStateMock = jest
        .spyOn(React, "useState")
        .mockImplementation(() => [
          pnBannerFlowStateEnum.WAITING_USER_INPUT,
          mockSetState
        ]);

      const expectedState =
        result === "success"
          ? pnBannerFlowStateEnum.SUCCESS_ACTIVATION
          : pnBannerFlowStateEnum.FAILURE_ACTIVATION;

      const component = renderComponent(result === "success");
      expect(component).toBeDefined();
      const cta = component.getByTestId("enable-pn-cta");
      expect(cta).toBeDefined();
      fireEvent.press(cta);
      expect(mockSetState).toHaveBeenCalledWith(expectedState);

      // ---- new screen rendered ----

      useStateMock.mockImplementation(() => [expectedState, mockSetState]);
      const componentAgain = renderComponent();
      const expectedId = `${result}-${expectedState}`;
      const newScreen = componentAgain.getByTestId(expectedId);
      expect(newScreen).toBeDefined();
    });
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
        yield* put(pnActivationUpsert.success(true));
      } else {
        action.payload.onFailure?.();

        yield* put(pnActivationUpsert.failure(new Error()));
      }
    }
  );
}

const renderComponent = (sagaSuccess: boolean = true) => {
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
