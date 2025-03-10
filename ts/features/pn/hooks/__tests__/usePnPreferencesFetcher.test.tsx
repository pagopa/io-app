import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import {
  ServicePreferenceResponse,
  WithServiceID
} from "../../../services/details/types/ServicePreferenceResponse";
import PN_ROUTES from "../../navigation/routes";
import { usePnPreferencesFetcher } from "../usePnPreferencesFetcher";
import { NetworkError } from "../../../../utils/errors";

jest.mock("../../../../store/hooks");
jest.mock("../../../services/details/store/actions/preference");

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
const mockUseIOSelector = useIOSelector as jest.Mock;

const pnServiceId = "PN_SID" as ServiceId;
describe("usePnPreferencesFetcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIODispatch.mockReturnValue(mockDispatch);
  });

  it("should dispatch loadServicePreference, and return a loading state if service data is not already loaded", () => {
    const servicePreferencePot = pot.none;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(mockDispatch).toHaveBeenCalledWith(
      loadServicePreference.request(pnServiceId)
    );
    expect(testingHookData.isLoading).toBe(true);
    expect(testingHookData.isError).toBe(false);
    expect(testingHookData.isEnabled).toBe(false);
  });

  it("should return the correct 'enabled' value, plus a loading state when service id is correct and preference is pot.someLoading", () => {
    const servicePreferencePot = pot.someLoading({
      id: pnServiceId,
      kind: "success",
      value: { inbox: true }
    }) as PreferencePotState;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(testingHookData.isLoading).toBe(true);
    expect(testingHookData.isError).toBe(false);
    expect(testingHookData.isEnabled).toBe(true);
  });

  it("should return correct values when service id is correct and preference is pot.some(true)", () => {
    const servicePreferencePot = pot.some({
      id: pnServiceId,
      kind: "success",
      value: { inbox: true }
    }) as PreferencePotState;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(testingHookData.isLoading).toBe(false);
    expect(testingHookData.isError).toBe(false);
    expect(testingHookData.isEnabled).toBe(true);
  });
  it("should return correct values when service id is correct and preference is pot.some(false)", () => {
    const servicePreferencePot = pot.some({
      id: pnServiceId,
      kind: "success",
      value: { inbox: false }
    }) as PreferencePotState;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(testingHookData.isLoading).toBe(false);
    expect(testingHookData.isError).toBe(false);
    expect(testingHookData.isEnabled).toBe(false);
  });

  it("should return correct values when service id is correct and preference is error", () => {
    const servicePreferencePot = pot.someError(
      {
        id: pnServiceId,
        kind: "success",
        value: { inbox: true }
      },
      { id: pnServiceId, kind: "error", value: new Error("whatever") }
    ) as unknown as PreferencePotState;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(testingHookData.isLoading).toBe(false);
    expect(testingHookData.isError).toBe(true);
    expect(testingHookData.isEnabled).toBe(true);
  });
  it("should fetch new data and force a loading state when service id is wrong and preference is some", () => {
    const servicePreferencePot = pot.some({
      id: "WRONG_SID",
      kind: "success",
      value: { inbox: true }
    }) as PreferencePotState;

    mockUseIOSelector.mockReturnValue(servicePreferencePot);

    renderHook();

    expect(mockDispatch).toHaveBeenCalledWith(
      loadServicePreference.request(pnServiceId)
    );

    expect(testingHookData.isLoading).toBe(true);
    expect(testingHookData.isError).toBe(false);
    expect(testingHookData.isEnabled).toBe(false);
  });
});

const renderHook = () => {
  const Component = () => {
    const data = usePnPreferencesFetcher(pnServiceId);
    testingHookData = data;
    return <></>;
  };
  const globalState = appReducer(
    {} as GlobalState,
    applicationChangeState("active")
  );
  return renderScreenWithNavigationStoreContext(
    Component,
    PN_ROUTES.ACTIVATION_BANNER_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};
