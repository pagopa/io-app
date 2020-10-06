import { SagaIterator } from "@redux-saga/core";
import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram
} from "../../store/actions/onboarding";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { RTron } from "../../../../../boot/configureStoreAndPersistor";

export function* executeAndDispatch(
  remoteCall:
    | ReturnType<typeof BackendBpdClient>["enrollCitizenIO"]
    | ReturnType<typeof BackendBpdClient>["find"],
  action: typeof bpdEnrollUserToProgram | typeof bpdLoadActivationStatus
) {
  try {
    const enrollCitizenIOResult: SagaCallReturnType<typeof remoteCall> = yield call(
      remoteCall,
      // due to avoid required headers coming from code autogenerate
      // (note the required header will be injected automatically)
      {} as any
    );
    if (enrollCitizenIOResult.isRight()) {
      if (enrollCitizenIOResult.value.status === 200) {
        const { enabled, payoffInstr } = enrollCitizenIOResult.value.value;
        yield put(
          action.success({
            enabled,
            payoffInstr
          })
        );
        return;
      } else if (enrollCitizenIOResult.value.status === 404) {
        yield put(
          action.success({
            enabled: false,
            payoffInstr: undefined
          })
        );
        return;
      }
      throw new Error(`response status ${enrollCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(enrollCitizenIOResult.value));
    }
  } catch (e) {
    yield put(bpdEnrollUserToProgram.failure(e));
  }
}

/**
 * make a request to get the citizen status
 */
export function* getCitizen(
  findCitizen: ReturnType<typeof BackendBpdClient>["find"]
): SagaIterator {
  yield call(executeAndDispatch, findCitizen, bpdLoadActivationStatus);
}

/**
 * make a request to enroll the citizen to the bpd
 */
export function* putEnrollCitizen(
  enrollCitizenIO: ReturnType<typeof BackendBpdClient>["enrollCitizenIO"]
): SagaIterator {
  yield call(executeAndDispatch, enrollCitizenIO, bpdEnrollUserToProgram);
}

/**
 * make a request to delete citizen from bpd program
 */
export function* deleteCitizen(
  deleteCitizenIO: ReturnType<typeof BackendBpdClient>["deleteCitizenIO"]
): SagaIterator {
  try {
    RTron.log("pre");
    const deleteCitizenIOResult: SagaCallReturnType<typeof deleteCitizenIO> = yield call(
      deleteCitizenIO,
      {} as any
    );
    RTron.log(deleteCitizenIOResult);
    if (deleteCitizenIOResult.isRight()) {
      if (deleteCitizenIOResult.value.status === 204) {
        yield put(bpdDeleteUserFromProgram.success());
      }
      throw new Error(`response status ${deleteCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(deleteCitizenIOResult.value));
    }
  } catch (e) {
    yield put(bpdDeleteUserFromProgram.failure(e));
  }
}
