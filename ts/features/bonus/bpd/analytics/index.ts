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
import {
  bpdDetailsLoadAll,
  bpdLoadActivationStatus
} from "../store/actions/details";
import {
  addBancomatToWallet,
  loadAbi,
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel,
  walletAddBancomatCompleted,
  walletAddBancomatStart
} from "../../../wallet/onboarding/bancomat/store/actions";
import { bpdAmountLoad } from "../store/actions/amount";
import { bpdPeriodsLoad } from "../store/actions/periods";
import { bpdSelectPeriod } from "../store/actions/selectedPeriod";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation
} from "../store/actions/paymentMethods";
import { isTimeoutError } from "../../../../utils/errors";

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
        trxDate: action.payload.results.map(r => r.trxDate.toString()),
        circuitType: action.payload.results.map(r => r.circuitType)
      });
    case getType(bpdTransactionsLoad.failure):
    case getType(bpdAmountLoad.failure):
      return mp.track(action.type, {
        awardPeriodId: action.payload.awardPeriodId,
        reason: action.payload.error.message
      });

    // CashBack details
    case getType(bpdDetailsLoadAll):
    case getType(bpdLoadActivationStatus.request):
      return mp.track(action.type);
    case getType(bpdLoadActivationStatus.success):
      return mp.track(action.type, {
        enabled: action.payload.enabled
      });
    case getType(bpdLoadActivationStatus.failure):
      return mp.track(action.type, { reason: action.payload.message });

    // Bancomat
    case getType(walletAddBancomatStart):
    case getType(walletAddBancomatCompleted):
    case getType(walletAddBancomatCancel):
    case getType(walletAddBancomatBack):
    case getType(loadAbi.request):
    case getType(addBancomatToWallet.request):
    case getType(addBancomatToWallet.success):
      return mp.track(action.type);

    case getType(loadAbi.success):
      return mp.track(action.type, {
        count: action.payload.data?.length
      });
    case getType(searchUserPans.request):
      return mp.track(action.type, { abi: action.payload ?? "all" });
    case getType(searchUserPans.success):
      const messages = action.payload.messages.reduce(
        (acc, val) => {
          if (
            val.caName !== undefined &&
            val.cardsNumber !== undefined &&
            val.code !== undefined
          ) {
            return {
              ...acc,
              [`${val.caName}cardsNumber`]: val.cardsNumber,
              [`${val.caName}code`]: val.code
            };
          }
          return acc;
        },
        { caNames: action.payload.messages.map(m => m.caName?.toString()) } as {
          [key: string]: string | number | ReadonlyArray<string>;
        }
      );
      return mp.track(action.type, {
        count: action.payload.cards.length,
        ...messages
      });

    case getType(loadAbi.failure):
    case getType(addBancomatToWallet.failure):
      return mp.track(action.type, { reason: action.payload.message });

    case getType(searchUserPans.failure):
      return mp.track(action.type, {
        reason: isTimeoutError(action.payload)
          ? action.payload.kind
          : action.payload.value.message
      });

    // Amount
    case getType(bpdAmountLoad.request):
      return mp.track(action.type, { awardPeriodId: action.payload });
    case getType(bpdAmountLoad.success):
      return mp.track(action.type, {
        awardPeriodId: action.payload.awardPeriodId
      });
    case getType(bpdSelectPeriod): // SelectedPeriod
      return mp.track(action.type, {
        awardPeriodId: action.payload.period.awardPeriodId
      });

    // Period
    case getType(bpdPeriodsLoad.request):
      return mp.track(action.type);
    case getType(bpdPeriodsLoad.success):
      return mp.track(action.type, {
        count: action.payload.length
      });
    case getType(bpdPeriodsLoad.failure):
      return mp.track(action.type, { reason: action.payload.message });

    // PaymentMethod
    case getType(bpdPaymentMethodActivation.request):
      return mp.track(action.type, { hashPan: action.payload });
    case getType(bpdUpdatePaymentMethodActivation.request):
      return mp.track(action.type, {
        hashPan: action.payload.hPan,
        value: action.payload.value
      });
    case getType(bpdPaymentMethodActivation.success):
    case getType(bpdUpdatePaymentMethodActivation.success):
      return mp.track(action.type, {
        hashPan: action.payload.hPan,
        activationStatus: action.payload.activationStatus,
        activationDate: action.payload.activationDate,
        deactivationDate: action.payload.deactivationDate
      });
    case getType(bpdPaymentMethodActivation.failure):
    case getType(bpdUpdatePaymentMethodActivation.failure):
      return mp.track(action.type, {
        hashPan: action.payload.hPan,
        reason: action.payload.error.message
      });
  }
  return Promise.resolve();
};

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();
export default bpdEnabled ? trackAction : emptyTracking;
