import { fromNullable } from "fp-ts/lib/Option";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { bpdUpsertIban, IbanUpsertResult } from "../../store/actions/details";
import { SagaCallReturnType } from "../../../../../types/utils";
import { Iban } from "../../../../../../definitions/backend/Iban";

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
  ["UNKNOWN_PSP", IbanStatus.CANT_VERIFY],
  ["NOT_VALID", IbanStatus.NOT_VALID]
]);

const transformIbanOutCome = (
  ibanOutcome: string,
  iban: Iban
): IbanUpsertResult => {
  const status: IbanStatus = fromNullable(
    ibanStatusMapping.get(ibanOutcome)
  ).getOrElse(IbanStatus.UNKNOWN);
  // don't store iban if the outcome is NOT_VALID
  return {
    payoffInstr: status === IbanStatus.NOT_VALID ? undefined : iban,
    status
  };
};

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
    const iban: Iban = action.payload;
    const updatePaymentMethodResult: SagaCallReturnType<ReturnType<
      typeof updatePaymentMethod
    >> = yield call(updatePaymentMethod(iban));
    if (updatePaymentMethodResult.isRight()) {
      if (updatePaymentMethodResult.value.status === 200) {
        const validationStatus =
          updatePaymentMethodResult.value.value?.validationStatus;
        yield put(
          bpdUpsertIban.success(transformIbanOutCome(validationStatus, iban))
        );
        return;
      }
      throw new Error(
        `response status ${updatePaymentMethodResult.value.status}`
      );
    } else {
      throw new Error(readableReport(updatePaymentMethodResult.value));
    }
  } catch (e) {
    yield put(bpdUpsertIban.failure(e));
  }
}
