import { fromNullable } from "fp-ts/lib/Option";
import { call, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import * as pot from "italia-ts-commons/lib/pot";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { SagaCallReturnType } from "../../../../../types/utils";
import { Iban } from "../../../../../../definitions/backend/Iban";
import { bpdUpsertIban, IbanUpsertResult } from "../../store/actions/iban";
import { profileSelector } from "../../../../../store/reducers/profile";
import { readablePrivacyReport } from "../../../../../utils/reporters";
// representation of iban status
export enum IbanStatus {
  "OK" = "OK",
  "NOT_OWNED" = "NOT_OWNED",
  "CANT_VERIFY" = "CANT_VERIFY",
  "NOT_VALID" = "NOT_VALID",
  "UNKNOWN" = "UNKNOWN"
}

const ibanStatusMapping: Map<string, IbanStatus> = new Map<string, IbanStatus>([
  ["OK", IbanStatus.OK],
  ["KO", IbanStatus.NOT_OWNED],
  ["UNKNOWN_PSP", IbanStatus.CANT_VERIFY]
]);

const successCases = new Set<IbanStatus>([
  IbanStatus.OK,
  IbanStatus.CANT_VERIFY,
  IbanStatus.NOT_OWNED
]);

// convert the validation code coming from response to an internal logic status
const fromValidationToStatus = (ibanOutcome: string): IbanStatus =>
  fromNullable(ibanStatusMapping.get(ibanOutcome)).getOrElse(
    IbanStatus.UNKNOWN
  );

const transformIbanOutCome = (
  ibanStatus: IbanStatus,
  iban: Iban
): IbanUpsertResult => ({
  // don't store iban if the outcome is a failure
  payoffInstr: successCases.has(ibanStatus) ? iban : undefined,
  status: ibanStatus
});

/**
 * upsert the citizen iban
 */
export function* patchCitizenIban(
  updatePaymentMethod: ReturnType<
    typeof BackendBpdClient
  >["updatePaymentMethod"],
  action: ActionType<typeof bpdUpsertIban.request>
) {
  try {
    const profileState: ReturnType<typeof profileSelector> = yield select(
      profileSelector
    );
    if (pot.isNone(profileState)) {
      // it should never happen
      throw new Error(`profile is None`);
    }
    const iban: Iban = action.payload;
    const updatePaymentMethodResult: SagaCallReturnType<
      ReturnType<typeof updatePaymentMethod>
    > = yield call(updatePaymentMethod(iban, profileState.value), {});
    if (updatePaymentMethodResult.isRight()) {
      const statusCode = updatePaymentMethodResult.value.status;
      if (statusCode === 200 && updatePaymentMethodResult.value.value) {
        const validationStatus =
          updatePaymentMethodResult.value.value.validationStatus;
        yield put(
          bpdUpsertIban.success(
            transformIbanOutCome(fromValidationToStatus(validationStatus), iban)
          )
        );
        return;
      }
      // iban not valid
      else if (statusCode === 400) {
        yield put(
          bpdUpsertIban.success(
            transformIbanOutCome(IbanStatus.NOT_VALID, iban)
          )
        );
        return;
      }
      throw new Error(
        `response status ${updatePaymentMethodResult.value.status}`
      );
    } else {
      throw new Error(readablePrivacyReport(updatePaymentMethodResult.value));
    }
  } catch (e) {
    yield put(bpdUpsertIban.failure(e));
  }
}
