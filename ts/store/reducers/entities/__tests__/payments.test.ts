import { IPatternStringTag } from "italia-ts-commons/lib/strings";
import { paymentByRptIdReducer, INITIAL_STATE } from "../payments";
import { paymentCompletedSuccess } from "../../../actions/wallet/payment";
import { Transaction } from "../../../../types/pagopa";
import { myRptId } from "../../../../utils/testFaker";
import { differentProfileLoggedIn } from "../../../actions/crossSessions";

describe("paymentByRptIdReducer reducer", () => {
  const paymentCompletedAction1 = paymentCompletedSuccess({
    kind: "COMPLETED",
    transaction: { id: 123 } as Transaction,
    rptId: myRptId
  });

  const paymentCompletedAction2 = paymentCompletedSuccess({
    kind: "COMPLETED",
    transaction: { id: 345 } as Transaction,
    rptId: {
      ...myRptId,
      paymentNoticeNumber: {
        applicationCode: "12" as string & IPatternStringTag<"[0-9]{2}">,
        auxDigit: "0",
        checkDigit: "19" as string & IPatternStringTag<"[0-9]{2}">,
        iuv13: "1234788888888" as string & IPatternStringTag<"[0-9]{13}">
      }
    }
  });
  it("should add the payment", () => {
    const newState = paymentByRptIdReducer(undefined, paymentCompletedAction1);
    expect(Object.keys(newState).length).toEqual(1);
  });

  it("should update the same payment", () => {
    const newState = paymentByRptIdReducer(undefined, paymentCompletedAction1);
    expect(Object.keys(newState).length).toEqual(1);
  });

  it("should add a new payment", () => {
    const newState = paymentByRptIdReducer(
      paymentByRptIdReducer(undefined, paymentCompletedAction1),
      paymentCompletedAction2
    );
    expect(Object.keys(newState).length).toEqual(2);
  });

  it("should reset the state", () => {
    const notEmptyState = paymentByRptIdReducer(
      undefined,
      paymentCompletedAction1
    );
    const newState = paymentByRptIdReducer(
      notEmptyState,
      differentProfileLoggedIn()
    );
    expect(Object.keys(newState).length).toEqual(0);
    expect(
      paymentByRptIdReducer(notEmptyState, differentProfileLoggedIn())
    ).toEqual(INITIAL_STATE);
  });
});
