import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  aarAdresseeDenominationSelector,
  currentAARFlowData,
  currentAARFlowStateAssistanceErrorCode,
  currentAARFlowStateErrorDebugInfoSelector,
  currentAARFlowStateType,
  currentAarFlowIunSelector,
  thirdPartySenderDenominationSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../../messages/store/reducers/thirdPartyById";
import {
  AARFlowState,
  maybeIunFromAarFlowState,
  sendAARFlowStates
} from "../../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../../utils/testUtils";
import { INITIAL_AAR_FLOW_STATE } from "../../reducers";

// Mocks
const mockState = {} as any;
const mockIoMessageId = "test-id";

// Mock dependencies
jest.mock("../../../../../messages/store/reducers/thirdPartyById", () => ({
  thirdPartyFromIdSelector: jest.fn()
}));

describe("thirdPartySenderDenominationSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return senderDenomination when all data is present", () => {
    const thirdPartyMessagePot = pot.some({
      third_party_message: {
        details: {
          iun: "",
          notificationStatusHistory: [],
          recipients: [],
          senderDenomination: "Denomination",
          subject: ""
        }
      }
    });
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(
      thirdPartyMessagePot
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

  it("should return undefined if data structure is not a ThirdPartyMessage", () => {
    const thirdPartyMessagePot = pot.some({
      third_party_message: {
        details: {
          notificationStatusHistory: [],
          recipients: [],
          subject: ""
        }
      }
    });
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(
      pot.some(thirdPartyMessagePot)
    );

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if there are no details", () => {
    const thirdPartyMessagePot = pot.some({
      third_party_message: {
        attachments: []
      }
    });
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(
      pot.some(thirdPartyMessagePot)
    );

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if senderDenomination is missing", () => {
    const thirdPartyMessagePot = pot.some({
      third_party_message: {
        details: {
          iun: "",
          notificationStatusHistory: [],
          recipients: [],
          subject: ""
        }
      }
    });
    (thirdPartyFromIdSelector as jest.Mock).mockReturnValue(
      thirdPartyMessagePot
    );

    const result = thirdPartySenderDenominationSelector(
      mockState,
      mockIoMessageId
    );
    expect(result).toBeUndefined();
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
describe("currentAARFlowStateAssistanceErrorCode", () => {
  const testCases: Array<{
    description: string;
    traceId?: string;
    errors?: Array<{ code: string }>;
    aarFlowType?: string;
    expected: string | undefined;
  }> = [
    {
      description: "should return traceId if present, regardless of errors",
      traceId: "TRACE-12345",
      errors: [{ code: "ERROR1" }, { code: "ERROR2" }],
      expected: "TRACE-12345"
    },
    {
      description:
        "should return error codes joined if traceId is not present and errors are available",
      errors: [{ code: "ERROR1" }, { code: "ERROR2" }],
      expected: "ERROR1, ERROR2"
    },
    {
      description:
        "should return undefined if neither traceId nor errors are present",
      expected: undefined
    },
    {
      description:
        "should return undefined if errors array is empty and no traceId",
      errors: [],
      expected: undefined
    }
  ];

  testCases.forEach(({ description, traceId, errors, expected }) => {
    it(description, () => {
      const aarFlow: AARFlowState = {
        type: sendAARFlowStates.ko,
        previousState: sendAarMockStateFactory.fetchingQRData(),
        error: {
          detail: "Some error",
          status: 599,
          traceId,
          errors
        },
        debugData: {
          phase: "Fetch QRCode",
          reason: "A test reason"
        }
      };

      const mockGlobalState = {
        features: {
          pn: {
            aarFlow
          }
        }
      } as unknown as GlobalState;

      const result = currentAARFlowStateAssistanceErrorCode(mockGlobalState);
      expect(result).toEqual(expected);
    });
  });
});

describe("aarAdresseeDenominationSelector", () => {
  sendAarMockStates.forEach(state => {
    const fullName = (
      state as Extract<
        AARFlowState,
        { recipientInfo?: { denomination: string; taxId: string } }
      >
    ).recipientInfo?.denomination;
    it(`should return ${fullName} when state is ${state.type}`, () => {
      const mockGlobalState = {
        features: {
          pn: {
            aarFlow: state
          }
        }
      } as unknown as GlobalState;

      const result = aarAdresseeDenominationSelector(mockGlobalState);

      expect(result).toBe(fullName);
    });
  });
});

describe("currentAARFlowStateErrorDebugInfoSelector", () => {
  const nonErrorStates = sendAarMockStates.filter(
    s => s.type !== sendAARFlowStates.ko
  );

  nonErrorStates.forEach(state => {
    it(`should return an empty object for state ${state.type}`, () => {
      const mockGlobalState = {
        features: { pn: { aarFlow: state } }
      } as unknown as GlobalState;
      const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
      expect(result).toEqual({});
    });
  });

  const debugData = {
    phase: "Fetch QRCode" as const,
    reason: "A test reason"
  };

  it("should handle ErrorState with no errors and no traceId", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: { status: 599, detail: "Internal Server Error" },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: undefined,
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: undefined
    });
  });

  it("should handle ErrorState with no errors but traceId", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Internal Server Error",
        traceId: "trace-123"
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: undefined,
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with traceId and empty array errors", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: []
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with one error with code but no detail", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [{ code: "ERR01" }]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 ",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with one error with code and detail", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [{ code: "ERR01", detail: "Something is wrong" }]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 Something is wrong",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with two errors with code but no detail", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [{ code: "ERR01" }, { code: "ERR02" }]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 , ERR02 ",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with two errors, first with detail, second without", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [{ code: "ERR01", detail: "Detail 1" }, { code: "ERR02" }]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 Detail 1, ERR02 ",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with two errors, first without detail, second with", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [{ code: "ERR01" }, { code: "ERR02", detail: "Detail 2" }]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 , ERR02 Detail 2",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });

  it("should handle ErrorState with two errors with code and detail", () => {
    const state: AARFlowState = {
      type: sendAARFlowStates.ko,
      previousState: sendAarMockStateFactory.fetchingQRData(),
      error: {
        status: 599,
        detail: "Bad Request",
        traceId: "trace-123",
        errors: [
          { code: "ERR01", detail: "Detail 1" },
          { code: "ERR02", detail: "Detail 2" }
        ]
      },
      debugData
    };
    const mockGlobalState = {
      features: { pn: { aarFlow: state } }
    } as unknown as GlobalState;
    const result = currentAARFlowStateErrorDebugInfoSelector(mockGlobalState);
    expect(result).toEqual({
      errorCodes: "ERR01 Detail 1, ERR02 Detail 2",
      phase: debugData.phase,
      reason: debugData.reason,
      traceId: "trace-123"
    });
  });
});

describe("currentAarFlowIunSelector", () => {
  sendAarMockStates.forEach(state => {
    const mockGlobalState = {
      features: {
        pn: {
          aarFlow: state
        }
      }
    } as unknown as GlobalState;

    const selectorValue = currentAarFlowIunSelector(mockGlobalState);
    const maybeIunValue = maybeIunFromAarFlowState(state);

    it(`its return value should match maybeIunFromAarFlowState output -- state: ${state.type}`, () => {
      expect(selectorValue).toBe(maybeIunValue);
    });
  });
});
