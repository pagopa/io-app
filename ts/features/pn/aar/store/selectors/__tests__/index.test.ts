import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  currentAARFlowData,
  currentAARFlowStateErrorCodes,
  currentAARFlowStateType,
  isAAREnabled,
  thirdPartySenderDenominationSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as appVersion from "../../../../../../utils/appVersion";
import { thirdPartyFromIdSelector } from "../../../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../../../../store/types/transformers";
import { AARFlowState, sendAARFlowStates } from "../../../utils/stateUtils";
import { sendAarMockStateFactory } from "../../../utils/testUtils";
import { INITIAL_AAR_FLOW_STATE } from "../../reducers";

// Mocks
const mockState = {} as any;
const mockIoMessageId = "test-id";

// Mock dependencies
jest.mock("../../../../../messages/store/reducers/thirdPartyById", () => ({
  thirdPartyFromIdSelector: jest.fn()
}));
jest.mock("../../../../store/types/transformers", () => ({
  toPNMessage: jest.fn()
}));

describe("thirdPartySenderDenominationSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return senderDenomination when all data is present", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(
      O.some({ senderDenomination: "Denomination" })
    );

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBe("Denomination");
  });

  it("should return undefined if thirdPartyFromIdSelector returns none", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.none);

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if toPNMessage returns none", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(O.none);

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if senderDenomination is missing", () => {
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(pot.some({}));
    (toPNMessage as jest.Mock).mockReturnValue(O.some({}));

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });
});
describe("isAAREnabled selector", () => {
  [
    { local: true, remote: true, expect: true },
    { local: true, remote: false, expect: false },
    { local: false, remote: true, expect: false },
    { local: false, remote: false, expect: false }
  ].forEach(({ local, remote, expect: expected }) => {
    it(`Should return ${expected} when isAARLocalEnabled='${local}' and isAARRemoteEnabled='${remote}'`, () => {
      const state = {
        persistedPreferences: {
          isAarFeatureEnabled: local
        },
        remoteConfig: O.some({
          pn: {
            aar: {
              min_app_version: {
                android: remote ? "1.0.0.0" : "3.0.0.0",
                ios: remote ? "1.0.0.0" : "3.0.0.0"
              }
            }
          }
        })
      } as GlobalState;
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "2.0.0.0");

      const isAarFeatureEnabled = isAAREnabled(state);
      expect(isAarFeatureEnabled).toBe(expected);
    });
  });
});
describe(" currentAARFlowData and currentAARFlowStateType", () => {
  it(" should return the correct AAR flow state from the global state", () => {
    const mockFetchingState =
      sendAarMockStateFactory.fetchingNotificationData();

    const mockGlobalFetchingNotification = {
      features: {
        pn: {
          aarFlow: mockFetchingState
        }
      }
    } as unknown as GlobalState;

    const result = currentAARFlowData(mockGlobalFetchingNotification);
    const resultType = currentAARFlowStateType(mockGlobalFetchingNotification);
    expect(resultType).toEqual(mockFetchingState.type);
    expect(result).toEqual(mockFetchingState);
  });

  it("should return INITIAL_AAR_FLOW_STATE when explicitly set", () => {
    const mockInitialState = {
      features: {
        pn: {
          aarFlow: INITIAL_AAR_FLOW_STATE
        }
      }
    } as unknown as GlobalState;

    const result = currentAARFlowData(mockInitialState);
    const resultType = currentAARFlowStateType(mockInitialState);
    expect(result).toEqual(INITIAL_AAR_FLOW_STATE);
    expect(resultType).toEqual(INITIAL_AAR_FLOW_STATE.type);
  });
});
describe("currentAARFlowStateErrorCodes", () => {
  [
    [
      {
        code: "ERROR1"
      },
      {
        code: "ERROR2"
      },
      {
        code: "UNKNOWN_ERROR"
      }
    ],
    undefined
  ].forEach(errors =>
    it(`should return ${JSON.stringify(
      !errors ? [] : errors.map(x => x.code)
    )} when errors=${JSON.stringify(errors)}`, () => {
      const mockErrorState: AARFlowState = {
        type: sendAARFlowStates.ko,
        previousState: sendAarMockStateFactory.fetchingQRData(),
        error: {
          detail: "",
          status: 599,
          errors
        }
      };

      const mockGlobalState = {
        features: {
          pn: {
            aarFlow: mockErrorState
          }
        }
      } as unknown as GlobalState;

      const resultErrorCodes = currentAARFlowStateErrorCodes(mockGlobalState);
      if (!errors) {
        expect(resultErrorCodes).toEqual([]);
      } else {
        expect(resultErrorCodes).toEqual(errors.map(x => x.code));
      }
    })
  );
});
