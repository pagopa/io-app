import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import { useIODispatch } from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { NetworkError } from "../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { servicePreferencePotByIdSelector } from "../../../services/details/store/selectors";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../../services/details/types/ServicePreferenceResponse";
import PN_ROUTES from "../../navigation/routes";
import { usePnPreferencesFetcher } from "../usePnPreferencesFetcher";

jest.mock("../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../store/hooks"),
  useIODispatch: jest.fn()
}));
jest.mock("../../../services/details/store/selectors", () => ({
  ...jest.requireActual("../../../services/details/store/selectors"),
  servicePreferencePotByIdSelector: jest.fn()
}));
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn()
}));
// eslint-disable-next-line import/order
import { useState } from "react";

type PreferencePotState = pot.Pot<
  ServicePreferenceResponse,
  WithServiceID<NetworkError>
>;

// eslint-disable-next-line functional/no-let
let testingHookData: {
  isLoading: boolean;
  isError: boolean;
  isEnabled: boolean;
};

const mockDispatch = jest.fn();
const mockUseIODispatch = useIODispatch as jest.Mock;
const mockServicePreferencePotSelector =
  servicePreferencePotByIdSelector as jest.Mock;

const pnServiceId = "PN_SID" as ServiceId;
describe("usePnPreferencesFetcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useState as jest.Mock).mockImplementation(
      jest.requireActual("react").useState
    );
    mockUseIODispatch.mockReturnValue(mockDispatch);
  });

  describe("should return correct values", () => {
    const expectedReturnTypes = [
      { isLoading: true, isError: false, isEnabled: true },
      { isLoading: false, isError: false, isEnabled: true },
      { isLoading: false, isError: false, isEnabled: false },
      { isLoading: false, isError: true, isEnabled: true }
    ];

    const preferenceCases = [
      pot.someLoading({
        id: pnServiceId,
        kind: "success",
        value: { inbox: true }
      }),
      pot.some({
        id: pnServiceId,
        kind: "success",
        value: { inbox: true }
      }),
      pot.some({
        id: pnServiceId,
        kind: "success",
        value: { inbox: false }
      }),
      pot.someError(
        {
          id: pnServiceId,
          kind: "success",
          value: { inbox: true }
        },
        { id: pnServiceId, kind: "error", value: new Error("whatever") }
      )
    ] as Array<PreferencePotState>;
    const titles = [
      "pot.someLoading",
      "pot.some(true)",
      "pot.some(false)",
      "error"
    ];

    for (const [index, title] of titles.entries()) {
      it(` when id is correct and preference is ${title}`, () => {
        const servicePreferencePot = preferenceCases[+index];
        mockServicePreferencePotSelector.mockReturnValue(servicePreferencePot);

        renderHook();

        expect(testingHookData).toEqual(expectedReturnTypes[+index]);
        // The selector should be called with state and service ID
        expect(mockServicePreferencePotSelector).toHaveBeenCalledWith(
          expect.anything(),
          pnServiceId
        );
      });
    }
  });

  // it("should dispatch loadServicePreference, and return a loading state if service data is not already loaded", () => {
  //   (useState as jest.Mock).mockImplementationOnce(() => [false, jest.fn()]);
  //   const servicePreferencePot = pot.none;

  //   mockServicePreferencePotSelector.mockReturnValue(servicePreferencePot);

  //   renderHook();

  //   expect(testingHookData.isLoading).toBe(true);
  //   expect(testingHookData.isError).toBe(false);
  //   expect(testingHookData.isEnabled).toBe(false);
  //   expect(mockDispatch).toHaveBeenCalledWith(
  //     loadServicePreference.request(pnServiceId)
  //   );
  // });
});

const renderHook = () => {
  const Component = () => {
    const data = usePnPreferencesFetcher(pnServiceId);
    testingHookData = data;
    return <></>;
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    Component,
    PN_ROUTES.ACTIVATION_BANNER_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};
