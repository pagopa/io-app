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
import {
  bpdTransactionsLoad,
  bpdTransactionsLoadRequiredData
} from "../store/actions/transactions";
import { bpdAllData, bpdLoadActivationStatus } from "../store/actions/details";
import { bpdSelectPeriod } from "../store/actions/selectedPeriod";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation
} from "../store/actions/paymentMethods";

const trackAction =
  (mp: NonNullable<typeof mixpanel>) =>
  // eslint-disable-next-line complexity
  (action: Action): Promise<void> => {
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
      case getType(bpdAllData.failure):
        return mp.track(action.type, { reason: action.payload.message });

      // IBAN
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
      case getType(bpdTransactionsLoad.failure):
      case getType(bpdTransactionsLoadRequiredData.failure):
        return mp.track(action.type, {
          awardPeriodId: action.payload.awardPeriodId,
          reason: action.payload.error.message
        });
      case getType(bpdTransactionsLoad.request):
      case getType(bpdTransactionsLoadRequiredData.request):
      case getType(bpdTransactionsLoadRequiredData.success):
        return mp.track(action.type, { awardPeriodId: action.payload });
      case getType(bpdTransactionsLoad.success):
      case getType(bpdSelectPeriod): // SelectedPeriod
        return mp.track(action.type, {
          awardPeriodId: action.payload.awardPeriodId
        });
      // CashBack details
      case getType(bpdAllData.request):
      case getType(bpdAllData.success):
      case getType(bpdLoadActivationStatus.request):
        return mp.track(action.type);
      case getType(bpdLoadActivationStatus.success):
        return mp.track(action.type, {
          enabled: action.payload.enabled,
          hasTechnicalIban: action.payload.technicalAccount !== undefined
        });
      case getType(bpdLoadActivationStatus.failure):
        return mp.track(action.type, { reason: action.payload.message });

      // PaymentMethod
      case getType(bpdPaymentMethodActivation.request):
      case getType(bpdUpdatePaymentMethodActivation.request):
      case getType(bpdPaymentMethodActivation.success):
      case getType(bpdUpdatePaymentMethodActivation.success):
      case getType(bpdPaymentMethodActivation.failure):
      case getType(bpdUpdatePaymentMethodActivation.failure):
        return mp.track(action.type);
    }
    return Promise.resolve();
  };

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default bpdEnabled ? trackAction : emptyTracking;
