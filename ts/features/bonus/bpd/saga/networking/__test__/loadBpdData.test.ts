import { testSaga } from "redux-saga-test-plan";
import { abiSelector } from "../../../../../wallet/onboarding/store/abi";
import { remoteReady } from "../../../model/RemoteValue";
import {
  bpdAllData,
  bpdLoadActivationStatus
} from "../../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../../store/actions/periods";
import { loadBpdData, testableFunctions } from "../loadBpdData";

// TODO: tested only two base case, add more if needed
describe("loadBpdData", () => {
  it("Dispatch bpdAllData.success if the user is not enrolled", () => {
    testSaga(loadBpdData)
      .next()
      .select(abiSelector)
      .next(remoteReady({}))
      .call(testableFunctions.checkPreviousFailures!)
      .next()
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([bpdLoadActivationStatus.success, bpdLoadActivationStatus.failure])
      .next(
        bpdLoadActivationStatus.success({
          enabled: false,
          activationStatus: "never",
          payoffInstr: undefined
        })
      )
      .put(bpdAllData.success())
      .next()
      .isDone();
  });
  it("Dispatch bpdAllData.success if the user is enrolled and all subsequent requests are successful", () => {
    testSaga(loadBpdData)
      .next()
      .select(abiSelector)
      .next(remoteReady({}))
      .call(testableFunctions.checkPreviousFailures!)
      .next()
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([bpdLoadActivationStatus.success, bpdLoadActivationStatus.failure])
      .next(
        bpdLoadActivationStatus.success({
          enabled: true,
          activationStatus: "subscribed",
          payoffInstr: undefined
        })
      )
      .put(bpdPeriodsAmountLoad.request())
      .next()
      .take([bpdPeriodsAmountLoad.success, bpdPeriodsAmountLoad.failure])
      .next(bpdPeriodsAmountLoad.success([]))
      .put(bpdAllData.success())
      .next()
      .isDone();
  });
});
