import { ActionArgs } from "xstate";
import { IOToast } from "@pagopa/io-app-design-system";
import { default as configureMockStore } from "redux-mock-store";
import {
  IOStackNavigationProp,
  AppParamsList
} from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { trackItWalletIDMethodSelected } from "../../../analytics";
import { createEidIssuanceActionsImplementation } from "../actions";
import { Context } from "../context";
import { EidIssuanceEvents } from "../events";

jest.mock("../../../analytics", () => ({
  trackItWalletIDMethodSelected: jest.fn(),
  trackItwDeactivated: jest.fn(),
  trackItwIdAuthenticationCompleted: jest.fn(),
  trackItwIdVerifiedDocument: jest.fn(),
  trackSaveCredentialSuccess: jest.fn()
}));

function createMockStore() {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  return mockStore(defaultState);
}

describe("itwEidIssuanceMachine actions", () => {
  const mockStore = createMockStore() as ReturnType<typeof useIOStore>;
  const mockNavigation = new Proxy(
    {},
    {
      get: () => jest.fn()
    }
  ) as unknown as IOStackNavigationProp<AppParamsList, keyof AppParamsList>;

  const mockToast: IOToast = {
    ...IOToast,
    hideAll: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track ITW_ID_METHOD_SELECTED when selecting an identification mode", () => {
    const { trackIdentificationMethodSelected } =
      createEidIssuanceActionsImplementation(
        mockNavigation,
        mockStore,
        mockToast
      );

    trackIdentificationMethodSelected({
      context: {
        level: "l2-fallback"
      },
      event: {
        type: "select-identification-mode",
        mode: "cieId"
      }
    } as ActionArgs<Context, EidIssuanceEvents, EidIssuanceEvents>);

    expect(trackItWalletIDMethodSelected).toHaveBeenCalledWith({
      ITW_ID_method: "cieId",
      itw_flow: "L2"
    });
  });
});
