import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { bpdEnabled } from "../../../../config";
import {
  bpdDeleteUserFromProgram,
  bpdEnrollUserToProgram,
  bpdOnboardingAcceptDeclaration,
  bpdOnboardingCancel,
  bpdOnboardingCompleted,
  bpdOnboardingStart,
  bpdUnsubscribeCompleted,
  bpdUserActivate
} from "../store/actions/onboarding";
import {
  bpdIbanInsertionCancel,
  bpdIbanInsertionContinue,
  bpdIbanInsertionResetScreen,
  bpdIbanInsertionStart,
  bpdUpsertIban
} from "../store/actions/iban";
import { bpdTransactionsLoad } from "../store/actions/transactions";

// eslint-disable-next-line complexity
const trackAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    // onboarding
    case getType(bpdEnrollUserToProgram.request):
    case getType(bpdDeleteUserFromProgram.success):
    case getType(bpdDeleteUserFromProgram.request):
    case getType(bpdUnsubscribeCompleted):
    case getType(bpdOnboardingStart):
    case getType(bpdUserActivate):
    case getType(bpdOnboardingCancel):
    case getType(bpdOnboardingCompleted):
    case getType(bpdOnboardingAcceptDeclaration):
      return mp.track(action.type);
    case getType(bpdEnrollUserToProgram.success):
      return mp.track(action.type, { bpdEnroll: action.payload.enabled });
    case getType(bpdDeleteUserFromProgram.failure):
    case getType(bpdEnrollUserToProgram.failure):
      return mp.track(action.type, { reason: action.payload.message });

    // iban
    case getType(bpdIbanInsertionStart):
    case getType(bpdIbanInsertionContinue):
    case getType(bpdIbanInsertionCancel):
    case getType(bpdIbanInsertionResetScreen):
    case getType(bpdUpsertIban.request):
      return mp.track(action.type);
    case getType(bpdUpsertIban.success):
      return mp.track(action.type, { ibanStatus: action.payload.status });
    case getType(bpdUpsertIban.failure):
      return mp.track(action.type, { reason: action.payload.message });

    // transactions
    case getType(bpdTransactionsLoad.request):
      return mp.track(action.type, { awardPeriodId: action.payload });
    case getType(bpdTransactionsLoad.success):
      return mp.track(action.type, {
        awardPeriodId: action.payload.awardPeriodId,
        hashPan: action.payload.results.map(r => r.hashPan),
        idTrxAcquirer: action.payload.results.map(r => r.idTrxAcquirer),
        idTrxIssuer: action.payload.results.map(r => r.idTrxIssuer),
        trxDate: action.payload.results.map(r => r.trxDate),
        circuitType: action.payload.results.map(r => r.circuitType)
      });
    case getType(bpdTransactionsLoad.failure):
      return mp.track(action.type, {
        awardPeriodId: action.payload.awardPeriodId,
        reason: action.payload.error
      });
  }
  return Promise.resolve();
};

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default bpdEnabled ? trackAction : emptyTracking;
