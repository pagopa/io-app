import { SagaIterator } from "@redux-saga/core";
import { call, put } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdUpdateOptInStatusMethod
} from "../../store/actions/onboarding";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import { getError } from "../../../../../utils/errors";

export function* executeAndDispatchV2(
  remoteCall:
    | ReturnType<typeof BackendBpdClient>["enrollCitizenV2IO"]
    | ReturnType<typeof BackendBpdClient>["findV2"],
  action: typeof bpdEnrollUserToProgram | typeof bpdLoadActivationStatus
) {
  try {
    const enrollCitizenIOResult: SagaCallReturnType<typeof remoteCall> =
      yield* call(
        remoteCall,
        // due to avoid required headers coming from code autogenerate
        // (note the required header will be injected automatically)
        {} as any
      );
    if (enrollCitizenIOResult.isRight()) {
      if (enrollCitizenIOResult.value.status === 200) {
        const { enabled, payoffInstr, technicalAccount, optInStatus } =
          enrollCitizenIOResult.value.value;
        yield* put(
          action.success({
            enabled,
            payoffInstr,
            technicalAccount,
            optInStatus
          })
        );
        return;
      } else if (enrollCitizenIOResult.value.status === 404) {
        yield* put(
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
    yield* put(action.failure(e));
  }
}

export function* getCitizenV2(
  findCitizen: ReturnType<typeof BackendBpdClient>["findV2"]
): SagaIterator {
  yield* call(executeAndDispatchV2, findCitizen, bpdLoadActivationStatus);
}

export function* putEnrollCitizenV2(
  enrollCitizenIO: ReturnType<typeof BackendBpdClient>["enrollCitizenV2IO"]
): SagaIterator {
  yield* call(executeAndDispatchV2, enrollCitizenIO, bpdEnrollUserToProgram);
}

/**
 * update the citizen OptInStatus
 * @param updateCitizenIO
 * @param action
 */
export function* putOptInStatusCitizenV2(
  updateCitizenIO: ReturnType<typeof BackendBpdClient>["enrollCitizenV2IO"],
  action: ActionType<typeof bpdUpdateOptInStatusMethod.request>
) {
  try {
    const updateCitizenIOResult: SagaCallReturnType<typeof updateCitizenIO> =
      yield call(
        updateCitizenIO,
        // due to avoid required headers coming from code autogenerate
        // (note the required header will be injected automatically)
        { citizenOptInStatus: action.payload } as any
      );

    if (updateCitizenIOResult.isRight()) {
      if (updateCitizenIOResult.value.status === 200) {
        if (updateCitizenIOResult.value.value.optInStatus) {
          const { optInStatus } = updateCitizenIOResult.value.value;
          yield put(bpdUpdateOptInStatusMethod.success(optInStatus));
          return;
        } else {
          // it should never happen
          bpdUpdateOptInStatusMethod.failure(
            new Error(`optInStatus is undefined`)
          );
        }
      } else {
        yield put(
          bpdUpdateOptInStatusMethod.failure(
            new Error(`response status ${updateCitizenIOResult.value.status}`)
          )
        );
      }
    } else {
      yield put(
        bpdUpdateOptInStatusMethod.failure(
          new Error(readableReport(updateCitizenIOResult.value))
        )
      );
    }
  } catch (e) {
    yield put(bpdUpdateOptInStatusMethod.failure(getError(e)));
  }
}

/**
 * make a request to delete citizen from bpd program
 */
export function* deleteCitizen(
  deleteCitizenIO: ReturnType<typeof BackendBpdClient>["deleteCitizenIO"]
): SagaIterator {
  try {
    const deleteCitizenIOResult: SagaCallReturnType<typeof deleteCitizenIO> =
      yield* call(deleteCitizenIO, {} as any);
    if (deleteCitizenIOResult.isRight()) {
      if (deleteCitizenIOResult.value.status === 204) {
        yield* put(bpdDeleteUserFromProgram.success());
        return;
      }
      throw new Error(`response status ${deleteCitizenIOResult.value.status}`);
    } else {
      throw new Error(readableReport(deleteCitizenIOResult.value));
    }
  } catch (e) {
    yield* put(bpdDeleteUserFromProgram.failure(e));
  }
}
