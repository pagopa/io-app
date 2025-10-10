import { PinString } from "../../../../../types/PinString";
import { IdentificationBackActionType } from "../../reducers";
import * as actions from "../index";

const payload = {
  pin: "123456" as PinString,
  canResetPin: true,
  isValidatingTask: false,
  identificationGenericData: { message: "Test" },
  identificationCancelData: { label: "Cancel", onCancel: jest.fn() },
  identificationSuccessData: { onSuccess: jest.fn() },
  shufflePad: false,
  identificationContext: IdentificationBackActionType.DEFAULT
};

describe("identification actions", () => {
  it("should create an identificationRequest action", () => {
    const action = actions.identificationRequest(
      payload.canResetPin,
      payload.isValidatingTask,
      payload.identificationGenericData,
      payload.identificationCancelData,
      payload.identificationSuccessData,
      payload.shufflePad,
      payload.identificationContext
    );
    const { pin, ...payloadWithoutPin } = payload;
    expect(action).toEqual({
      type: "IDENTIFICATION_REQUEST",
      payload: payloadWithoutPin
    });
  });

  it("should create an identificationStart action", () => {
    const action = actions.identificationStart(
      payload.pin,
      payload.canResetPin,
      payload.isValidatingTask,
      payload.identificationGenericData,
      payload.identificationCancelData,
      payload.identificationSuccessData,
      payload.shufflePad,
      payload.identificationContext
    );
    expect(action).toEqual({ type: "IDENTIFICATION_START", payload });
  });

  it("should create an identificationCancel action", () => {
    const action = actions.identificationCancel();
    expect(action).toEqual({ type: "IDENTIFICATION_CANCEL" });
  });

  it("should create an identificationSuccess action", () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const payload = { isBiometric: true };
    const action = actions.identificationSuccess(payload);
    expect(action).toEqual({ type: "IDENTIFICATION_SUCCESS", payload });
  });

  it("should create an identificationFailure action", () => {
    const action = actions.identificationFailure();
    expect(action).toEqual({ type: "IDENTIFICATION_FAILURE" });
  });
});
