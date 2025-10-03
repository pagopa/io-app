import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState,
  terminateAarFlow
} from "..";
import { ThirdPartyMessage } from "../../../../../../../definitions/pn/ThirdPartyMessage";
import { AARFlowState, sendAARFlowStates } from "../../../utils/stateUtils";
import { MessageBodyMarkdown } from "../../../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../../../definitions/backend/MessageSubject";

describe("AARFlowStateActions", () => {
  const payload: AARFlowState = {
    type: sendAARFlowStates.displayingAARToS,
    qrCode: "https://www.google.com"
  };
  it(`Should have correct type="SET_AAR_FLOW_STATE" and payload: ${JSON.stringify(
    payload
  )}`, () => {
    const action = setAarFlowState(payload);
    expect(action.type).toBe("SET_AAR_FLOW_STATE");
    expect(action.payload).toEqual(payload);
  });

  it(`Should have correct type="TERMINATE_AAR_FLOW"`, () => {
    const action = terminateAarFlow();
    expect(action.type).toBe("TERMINATE_AAR_FLOW");
  });

  it("should match snapshot for populateStoresWithEphemeralAarMessageData", () => {
    const params = {
      iun: "some-iun" as NonEmptyString,
      thirdPartyMessage: {} as ThirdPartyMessage,
      fiscalCode: "1209381023813098123" as FiscalCode,
      pnServiceID: "some-Sid" as NonEmptyString,
      markDown: {} as MessageBodyMarkdown,
      subject: "" as MessageSubject,
      mandateId: ""
    };
    const action = populateStoresWithEphemeralAarMessageData(params);
    expect(action).toMatchSnapshot();
  });
});
