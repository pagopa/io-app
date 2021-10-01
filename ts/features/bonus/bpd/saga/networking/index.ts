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

export function* executeAndDispatchV2(
  remoteCall:
    | ReturnType<typeof BackendBpdClient>["enrollCitizenV2IO"]
    | ReturnType<typeof BackendBpdClient>["findV2"],
  action: typeof bpdEnrollUserToProgram | typeof bpdLoadActivationStatus
) {
  try {
    const enrollCitizenIOResult: SagaCallReturnType<typeof remoteCall> =
      yield call(
        remoteCall,
        // due to avoid required headers coming from code autogenerate
        // (note the required header will be injected automatically)
        {} as any
      );
    if (enrollCitizenIOResult.isRight()) {
      if (enrollCitizenIOResult.value.status === 200) {
        const { enabled, payoffInstr, technicalAccount } =
          enrollCitizenIOResult.value.value;
        yield put(
          action.success({
            enabled,
            payoffInstr,
            technicalAccount
          })
        );
        return;
      } else if (enrollCitizenIOResult.value.status === 404) {
        yield put(
          action.success({
            enabled: false,
            payoffInstr: undefined,
            technicalAccount: undefined
          })
        );
        return;
      }
      throw new Error(`response status ${enrollCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(enrollCitizenIOResult.value));
    }
  } catch (e) {
    yield put(action.failure(e));
  }
}

export function* getCitizenV2(
  findCitizen: ReturnType<typeof BackendBpdClient>["findV2"]
): SagaIterator {
  yield call(executeAndDispatchV2, findCitizen, bpdLoadActivationStatus);
}

export function* putEnrollCitizenV2(
  enrollCitizenIO: ReturnType<typeof BackendBpdClient>["enrollCitizenV2IO"]
): SagaIterator {
  yield call(executeAndDispatchV2, enrollCitizenIO, bpdEnrollUserToProgram);
}

/**
 * make a request to delete citizen from bpd program
 */
export function* deleteCitizen(
  deleteCitizenIO: ReturnType<typeof BackendBpdClient>["deleteCitizenIO"]
): SagaIterator {
  try {
    const deleteCitizenIOResult: SagaCallReturnType<typeof deleteCitizenIO> =
      yield call(deleteCitizenIO, {} as any);
    if (deleteCitizenIOResult.isRight()) {
      if (deleteCitizenIOResult.value.status === 204) {
        yield put(bpdDeleteUserFromProgram.success());
        return;
      }
      throw new Error(`response status ${deleteCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(deleteCitizenIOResult.value));
    }
  } catch (e) {
    yield put(bpdDeleteUserFromProgram.failure(e));
  }
}
