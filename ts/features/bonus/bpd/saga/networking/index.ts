import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { SagaIterator } from "@redux-saga/core";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { convertUnknownToError, getError } from "../../../../../utils/errors";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { bpdLoadActivationStatus } from "../../store/actions/details";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdUpdateOptInStatusMethod
} from "../../store/actions/onboarding";

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
    if (E.isRight(enrollCitizenIOResult)) {
      if (enrollCitizenIOResult.right.status === 200) {
        const { enabled, payoffInstr, technicalAccount, optInStatus } =
          enrollCitizenIOResult.right.value;
        yield* put(
          action.success({
            enabled,
            activationStatus: enabled ? "subscribed" : "unsubscribed",
            payoffInstr,
            technicalAccount,
            optInStatus
          })
        );
        return;
      } else if (enrollCitizenIOResult.right.status === 404) {
        yield* put(
          action.success({
            enabled: false,
            activationStatus: "never",
            payoffInstr: undefined,
            technicalAccount: undefined
          })
        );
        return;
      }
      throw new Error(`response status ${enrollCitizenIOResult.right.status}`);
    } else {
      throw new Error(readableReport(enrollCitizenIOResult.left));
    }
  } catch (e) {
    yield* put(action.failure(convertUnknownToError(e)));
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
      yield* call(
        updateCitizenIO,
        // due to avoid required headers coming from code autogenerate
        // (note the required header will be injected automatically)
        { optInStatus: action.payload } as any
      );

    if (E.isRight(updateCitizenIOResult)) {
      if (updateCitizenIOResult.right.status === 200) {
        if (updateCitizenIOResult.right.value.optInStatus) {
          const { optInStatus } = updateCitizenIOResult.right.value;
          yield* put(bpdUpdateOptInStatusMethod.success(optInStatus));
          return;
        } else {
          // it should never happen
          bpdUpdateOptInStatusMethod.failure(
            new Error(`optInStatus is undefined`)
          );
        }
      } else {
        yield* put(
          bpdUpdateOptInStatusMethod.failure(
            new Error(`response status ${updateCitizenIOResult.right.status}`)
          )
        );
      }
    } else {
      yield* put(
        bpdUpdateOptInStatusMethod.failure(
          new Error(readableReport(updateCitizenIOResult.left))
        )
      );
    }
  } catch (e) {
    yield* put(bpdUpdateOptInStatusMethod.failure(getError(e)));
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
    if (E.isRight(deleteCitizenIOResult)) {
      if (deleteCitizenIOResult.right.status === 204) {
        yield* put(bpdDeleteUserFromProgram.success());
        return;
      }
      throw new Error(`response status ${deleteCitizenIOResult.right.status}`);
    } else {
      throw new Error(readableReport(deleteCitizenIOResult.left));
    }
  } catch (e) {
    yield* put(bpdDeleteUserFromProgram.failure(convertUnknownToError(e)));
  }
}
