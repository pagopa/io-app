import { testSaga } from "redux-saga-test-plan";
import { optInDeletionChoiceHandler } from "../optInDeletionChoiceHandler";
import {
  DeleteAllByFunctionSuccess,
  deleteAllPaymentMethodsByFunction
} from "../../../../../../../store/actions/wallet/delete";
import { EnableableFunctionsEnum } from "../../../../../../../../definitions/pagopa/EnableableFunctions";
import { bpdUpdateOptInStatusMethod } from "../../../../store/actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

describe("optInDeletionChoiceHandler saga", () => {
  jest.useFakeTimers();

  it("If deleteAllPaymentMethodsByFunction fails, should return", () => {
    testSaga(optInDeletionChoiceHandler)
      .next()
      .put(
        deleteAllPaymentMethodsByFunction.request(EnableableFunctionsEnum.BPD)
      )
      .next()
      .take([
        deleteAllPaymentMethodsByFunction.success,
        deleteAllPaymentMethodsByFunction.failure
      ])
      .next(deleteAllPaymentMethodsByFunction.failure({ error: new Error() }))
      .isDone();
  });

  it("If deleteAllPaymentMethodsByFunction succeed, should put the bpdUpdateOptInStatusMethod.request action", () => {
    testSaga(optInDeletionChoiceHandler)
      .next()
      .put(
        deleteAllPaymentMethodsByFunction.request(EnableableFunctionsEnum.BPD)
      )
      .next()
      .take([
        deleteAllPaymentMethodsByFunction.success,
        deleteAllPaymentMethodsByFunction.failure
      ])
      .next(
        deleteAllPaymentMethodsByFunction.success(
          {} as DeleteAllByFunctionSuccess
        )
      )
      .put(bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.DENIED))
      .next()
      .isDone();
  });
});
