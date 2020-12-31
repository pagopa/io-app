import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { abiSelector } from "../../../../../wallet/onboarding/store/abi";
import { remoteReady } from "../../../model/RemoteValue";
import {
  bpdAllData,
  bpdLoadActivationStatus
} from "../../../store/actions/details";
import { bpdPeriodsAmountLoad } from "../../../store/actions/periods";
import { testableFunctions, loadBpdData } from "../loadBpdData";

// TODO: tested only two base case, add more if needed
describe("loadBpdData", () => {
  it("Dispatch bpdAllData.success if the user is not enrolled", () => {
    testSaga(loadBpdData)
      .next()
      .select(abiSelector)
      .next(remoteReady({}))
      .call(testableFunctions.checkPreviousFailures)
      .next()
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(
        bpdLoadActivationStatus.success({
          enabled: false,
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
      .call(testableFunctions.checkPreviousFailures)
      .next()
      .put(bpdLoadActivationStatus.request())
      .next()
      .take([
        getType(bpdLoadActivationStatus.success),
        getType(bpdLoadActivationStatus.failure)
      ])
      .next(
        bpdLoadActivationStatus.success({
          enabled: true,
          payoffInstr: undefined
        })
      )
      .put(bpdPeriodsAmountLoad.request())
      .next()
      .take([
        getType(bpdPeriodsAmountLoad.success),
        getType(bpdPeriodsAmountLoad.failure)
      ])
      .next(bpdPeriodsAmountLoad.success([]))
      .put(bpdAllData.success())
      .next()
      .all([])
      .next()
      .isDone();
  });
});
