import { Iban } from "../../../../../../../definitions/backend/Iban";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../model/RemoteValue";
import { IbanStatus } from "../../../saga/networking/patchCitizenIban";
import { bpdUpsertIban } from "../../actions/iban";

jest.mock("@react-native-async-storage/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("test state with action bpdUpsertIban", () => {
  const globalState: GlobalState = appReducer(
    undefined,
    applicationChangeState("active")
  );

  expect(
    globalState.bonus.bpd.details.activation.payoffInstr.enrolledValue
  ).toBe(remoteUndefined);

  expect(
    globalState.bonus.bpd.details.activation.payoffInstr.upsert.outcome
  ).toBe(remoteUndefined);

  it("check the state after a bpdUpsertIban.request", () => {
    const upsertResult = appReducer(
      globalState,
      bpdUpsertIban.request("IT12313" as Iban)
    );
    expect(
      upsertResult.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toBe(remoteUndefined);
    expect(
      upsertResult.bonus.bpd.details.activation.payoffInstr.upsert.outcome
    ).toBe(remoteLoading);
  });
  it("check the state after a bpdUpsertIban.success CANT_VERIFY", () => {
    const newIban = "IT123" as Iban;
    const result = appReducer(
      globalState,
      bpdUpsertIban.success({
        status: IbanStatus.CANT_VERIFY,
        payoffInstr: newIban
      })
    );

    expect(
      result.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toStrictEqual(remoteReady(newIban));
    expect(
      result.bonus.bpd.details.activation.payoffInstr.upsert
    ).toStrictEqual({
      outcome: remoteReady("CANT_VERIFY" as IbanStatus),
      value: newIban
    });
  });
  it("check the state after a bpdUpsertIban.success OK", () => {
    const newIban = "IT123" as Iban;
    const result = appReducer(
      globalState,
      bpdUpsertIban.success({
        status: IbanStatus.OK,
        payoffInstr: newIban
      })
    );

    expect(
      result.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toStrictEqual(remoteReady(newIban));
    expect(
      result.bonus.bpd.details.activation.payoffInstr.upsert
    ).toStrictEqual({
      outcome: remoteReady("OK" as IbanStatus),
      value: newIban
    });
  });
  it("check the state after a bpdUpsertIban.success NOT_VALID", () => {
    const result = appReducer(
      globalState,
      bpdUpsertIban.success({
        status: IbanStatus.NOT_VALID,
        payoffInstr: undefined
      })
    );

    expect(
      result.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toStrictEqual(remoteUndefined);
    expect(
      result.bonus.bpd.details.activation.payoffInstr.upsert
    ).toStrictEqual({
      outcome: remoteReady("NOT_VALID" as IbanStatus),
      value: undefined
    });
  });
  it("check the state after a bpdUpsertIban.success NOT_OWNED", () => {
    const result = appReducer(
      globalState,
      bpdUpsertIban.success({
        status: IbanStatus.NOT_OWNED,
        payoffInstr: undefined
      })
    );

    expect(
      result.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toStrictEqual(remoteUndefined);
    expect(
      result.bonus.bpd.details.activation.payoffInstr.upsert
    ).toStrictEqual({
      outcome: remoteReady("NOT_OWNED" as IbanStatus),
      value: undefined
    });
  });
  it("check the state after a bpdUpsertIban.failure", () => {
    const error = new Error("Error!");
    const result = appReducer(globalState, bpdUpsertIban.failure(error));

    expect(
      result.bonus.bpd.details.activation.payoffInstr.enrolledValue
    ).toStrictEqual(remoteUndefined);
    expect(
      result.bonus.bpd.details.activation.payoffInstr.upsert
    ).toStrictEqual({
      outcome: remoteError(error),
      value: undefined
    });
  });
});
