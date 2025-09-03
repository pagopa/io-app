import {
  aarFlowReducer,
  AARFlowState,
  currentAARFlowStateData,
  currentAARFlowStateType,
  INITIAL_AAR_FLOW_STATE
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { setAarFlowState, terminateAarFlow } from "../../actions";

const mockStates: ReadonlyArray<AARFlowState> = [
  { type: "none" },
  { type: "displayingAARToS", qrCode: "https://www.google.com" },
  { type: "fetchingQRData", qrCode: "https://www.bing.com" },
  {
    type: "fetchingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    iun: "000000000001"
  },
  {
    type: "fetchingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    iun: "000000000001",
    mandateId: "11110000000"
  },
  {
    type: "displayingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    notification: {}
  },
  {
    type: "displayingNotificationData",
    fullNameDestinatario: "Mario Rossi",
    notification: {},
    mandateId: "11110000000"
  },
  {
    type: "notAddresseeFinal",
    fullNameDestinatario: "Mario Rossi",
    iun: "000000000001",
    qrCode: "https://www.duckduckgo.com"
  }
];

describe("aarFlowReducer", () => {
  mockStates.forEach(payload => {
    const globalState = {
      features: {
        pn: {
          aarFlow: payload
        }
      }
    } as GlobalState;
    it(`setAarFlowState should set state with value='${JSON.stringify(
      payload
    )}'`, () => {
      const state = aarFlowReducer(undefined, setAarFlowState(payload));
      expect(state).toBe(payload);
    });
    it(`a ${JSON.stringify(
      payload
    )} state should reset upon receiving a terminateAarFlow action`, () => {
      const state = aarFlowReducer(payload, terminateAarFlow());
      expect(state).toBe(INITIAL_AAR_FLOW_STATE);
    });
    it(`currentAARFlowStateType should return ${
      payload.type
    } when the state is '${JSON.stringify(payload)}'`, () => {
      const currentAARType = currentAARFlowStateType(globalState);
      expect(currentAARType).toBe(payload.type);
    });

    it(`currentAARFlowStateData should return the full state when it is '${JSON.stringify(
      payload
    )}'`, () => {
      const currentAARData = currentAARFlowStateData(globalState);
      expect(currentAARData).toBe(payload);
    });
  });
});
