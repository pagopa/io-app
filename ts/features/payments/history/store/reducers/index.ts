/* eslint-disable complexity */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";

import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { Action } from "../../../../../store/actions/types";
import { createSetTransform } from "../../../../../store/transforms/setTransform";
import { getLookUpId } from "../../../../../utils/pmLookUpId";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../../utils/stringBuilder";
import { clearCache } from "../../../../settings/common/store/actions";
import * as analytics from "../../../checkout/analytics";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction
} from "../../../checkout/store/actions/networking";
import {
  initPaymentStateAction,
  selectPaymentMethodAction,
  selectPaymentPspAction
} from "../../../checkout/store/actions/orchestration";
import { WalletPaymentFailure } from "../../../checkout/types/WalletPaymentFailure";
import { getPspFlagType } from "../../../checkout/utils";
import {
  PaymentAnalyticsData,
  PaymentsAnalyticsHomeStatus
} from "../../../common/types/PaymentAnalytics";
import * as receiptsAnalytics from "../../../receipts/analytics";
import {
  getPaymentsLatestReceiptAction,
  getPaymentsReceiptDetailsAction,
  getPaymentsReceiptDownloadAction
} from "../../../receipts/store/actions";
import { getPaymentsWalletUserMethods } from "../../../wallet/store/actions";
import { PaymentHistory } from "../../types";
import {
  removeExpiredPaymentsOngoingFailedAction,
  storeNewPaymentAttemptAction,
  storePaymentIsOnboardedAction,
  storePaymentOutcomeToHistory,
  storePaymentsBrowserTypeAction
} from "../actions";

export type PaymentsHistoryState = {
  analyticsData?: PaymentAnalyticsData;
  archive: ReadonlyArray<PaymentHistory>;
  ongoingPayment?: PaymentHistory;
  paymentsOngoingFailed?: Record<RptId, PaymentsOngoingFailedClockTime>;
  PDFsOpened: Set<string>;
  receiptsOpened: Set<string>;
};

type PaymentsOngoingFailedClockTime = {
  appClock: number;
  wallClock: number;
};

const INITIAL_STATE: PaymentsHistoryState = {
  archive: [],
  receiptsOpened: new Set(),
  PDFsOpened: new Set(),
  paymentsOngoingFailed: {}
};

const ARCHIVE_SIZE = 15;

const reducer = (
  state: PaymentsHistoryState = INITIAL_STATE,
  action: Action
): PaymentsHistoryState => {
  switch (action.type) {
    case getType(clearCache):
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;
    case getType(getPaymentsLatestReceiptAction.success):
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          transactionsHomeLength: action.payload?.data.length ?? 0,
          paymentsHomeStatus: getPaymentsHomeStatus(
            state.analyticsData?.savedPaymentMethods?.length ?? 0,
            action.payload?.data.length ?? 0
          )
        }
      };
    case getType(getPaymentsReceiptDetailsAction.request): {
      const isFirstTimeOpening = !state.receiptsOpened.has(
        action.payload.transactionId
      );
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          receiptFirstTimeOpening: isFirstTimeOpening,
          receiptUser: action.payload.isPayer ? "payer" : "payee"
        },
        receiptsOpened: new Set(state.receiptsOpened).add(
          action.payload.transactionId
        )
      };
    }
    case getType(getPaymentsReceiptDetailsAction.success):
      receiptsAnalytics.trackPaymentsOpenReceipt({
        organization_name: action.payload.carts?.[0]?.payee?.name,
        organization_fiscal_code: action.payload.carts?.[0]?.payee?.taxCode,
        first_time_opening: state.analyticsData?.receiptFirstTimeOpening,
        user: state.analyticsData?.receiptUser
      });
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          receiptOrganizationFiscalCode:
            action.payload.carts?.[0]?.payee?.taxCode,
          receiptOrganizationName: action.payload.carts?.[0]?.payee?.name,
          receiptPayerFiscalCode: action.payload.infoNotice?.payer?.taxCode,
          receiptEventId: action.payload.infoNotice?.eventId
        }
      };
    case getType(getPaymentsReceiptDownloadAction.request): {
      const isFirstTimePDFOpening = !state.PDFsOpened.has(
        action.payload.transactionId
      );
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          receiptFirstTimeOpeningPDF: isFirstTimePDFOpening
        },
        PDFsOpened: new Set(state.PDFsOpened).add(action.payload.transactionId)
      };
    }
    case getType(getPaymentsWalletUserMethods.success):
    case getType(paymentsGetPaymentUserMethodsAction.success):
      const unavailablePaymentMethods = action.payload.wallets?.filter(wallet =>
        wallet.applications.find(
          app => app.name === "PAGOPA" && app.status !== "ENABLED"
        )
      );
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          savedPaymentMethods: action.payload.wallets,
          savedPaymentMethodsUnavailable: unavailablePaymentMethods,
          paymentsHomeStatus: getPaymentsHomeStatus(
            action.payload.wallets?.length ?? 0,
            state.analyticsData?.transactionsHomeLength ?? 0
          )
        }
      };
    case getType(initPaymentStateAction):
      return {
        ...state,
        analyticsData: {
          savedPaymentMethods: state.analyticsData?.savedPaymentMethods,
          startOrigin: action.payload.startOrigin,
          serviceName: action.payload.serviceName
        },
        ongoingPayment: {
          startOrigin: action.payload.startOrigin,
          startedAt: new Date(),
          lookupId: getLookUpId()
        }
      };
    case getType(paymentsCalculatePaymentFeesAction.success):
      const bundles = action.payload.bundles;
      const selectedPsp =
        bundles.length === 1 ? bundles[0].pspBusinessName : undefined;
      const selectedPspFlag = bundles.length === 1 ? "unique" : undefined;
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          selectedPsp,
          selectedPspFlag,
          pspList: bundles
        }
      };
    case getType(paymentsCreateTransactionAction.failure):
    case getType(paymentsGetPaymentDetailsAction.failure): {
      const failure = pipe(
        WalletPaymentFailure.decode(action.payload),
        O.fromEither,
        O.toUndefined
      );

      const rptId = state.ongoingPayment?.rptId;
      const isPaymentPptInProgress =
        failure?.faultCodeDetail === "PPT_PAGAMENTO_IN_CORSO";

      const failureDateEntry = {
        wallClock: Date.now(),
        appClock: performance.now()
      };

      const ongoingFailedUpdate =
        rptId && isPaymentPptInProgress && !state.paymentsOngoingFailed?.[rptId]
          ? { [rptId]: failureDateEntry }
          : {};

      return updatePaymentHistory(
        {
          ...state,
          paymentsOngoingFailed: {
            ...state.paymentsOngoingFailed,
            ...ongoingFailedUpdate
          }
        },
        { failure }
      );
    }
    case getType(paymentsCreateTransactionAction.success):
    case getType(paymentsGetPaymentTransactionInfoAction.success):
      return updatePaymentHistory(state, {
        transaction: action.payload
      });
    case getType(paymentsGetPaymentDetailsAction.request):
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          attempt: getPaymentAttemptByRptId(state, action.payload)
        },
        ongoingPayment: {
          ...state.ongoingPayment,
          rptId: action.payload,
          attempt: getPaymentAttemptByRptId(state, action.payload)
        }
      };
    case getType(paymentsGetPaymentDetailsAction.success):
      return {
        ...state,
        paymentsOngoingFailed: {
          ...state.paymentsOngoingFailed,
          [action.payload.rptId]: undefined
        },
        analyticsData: {
          ...state.analyticsData,
          verifiedData: action.payload,
          formattedAmount: formatNumberAmount(
            centsToAmount(action.payload.amount),
            true,
            "right"
          )
        },
        ongoingPayment: {
          ...state.ongoingPayment,
          verifiedData: action.payload
        }
      };
    case getType(paymentsGetPaymentTransactionInfoAction.failure):
      return updatePaymentHistory(state, {
        failure: pipe(
          WalletPaymentFailure.decode(action.payload),
          O.fromEither,
          O.toUndefined
        )
      });
    case getType(removeExpiredPaymentsOngoingFailedAction):
      if (!state.paymentsOngoingFailed) {
        return state;
      }
      return {
        ...state,
        paymentsOngoingFailed: Object.fromEntries(
          Object.entries(state.paymentsOngoingFailed).filter(
            ([rptId]) => !action.payload.includes(rptId as RptId)
          )
        )
      };
    case getType(selectPaymentMethodAction):
      const paymentMethodName =
        action.payload.userWallet?.details?.type ||
        action.payload.paymentMethod?.name;
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          selectedPaymentMethod: paymentMethodName
        }
      };
    case getType(selectPaymentPspAction):
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          selectedPsp: action.payload.pspBusinessName,
          selectedPspFlag: getPspFlagType(
            action.payload,
            state.analyticsData?.pspList
          )
        }
      };
    case getType(storeNewPaymentAttemptAction):
      return updatePaymentHistory(state, {}, true);
    case getType(storePaymentIsOnboardedAction):
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          is_onboarded: action.payload
        }
      };
    case getType(storePaymentOutcomeToHistory):
      return updatePaymentHistory(state, {
        outcome: action.payload,
        ...(action.payload === "0" ? { success: true } : {})
      });
    case getType(storePaymentsBrowserTypeAction):
      analytics.trackPaymentBrowserLanding({
        browser_type: action.payload
      });
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          browserType: action.payload
        }
      };
  }
  return state;
};

const getPaymentsHomeStatus = (
  savedPaymentMethods: number,
  transactions: number
): PaymentsAnalyticsHomeStatus => {
  if (savedPaymentMethods === 0 && transactions === 0) {
    return "empty";
  }
  if (savedPaymentMethods === 0 && transactions > 0) {
    return "empty method";
  }
  if (savedPaymentMethods > 0 && transactions === 0) {
    return "empty receipts";
  }
  return "complete";
};

const getPaymentAttemptByRptId = (state: PaymentsHistoryState, rptId: RptId) =>
  pipe(
    state.archive as Array<PaymentHistory>,
    A.findFirst(h => h.rptId === rptId),
    O.chainNullableK(h => h.attempt),
    O.getOrElse(() => 0)
  );

const appendItemToArchive = (
  archive: ReadonlyArray<PaymentHistory>,
  item: PaymentHistory
): ReadonlyArray<PaymentHistory> =>
  pipe(
    archive,
    // Remove previous entry if already exists
    a => a.filter(({ rptId }) => !_.isEqual(rptId, item.rptId)),
    // Keep only the latest ARCHIVE_SIZE - 1 entries
    a => a.slice(-ARCHIVE_SIZE + 1),
    // Add the new entry to the archive
    a => [...a, item]
  );

const updatePaymentHistory = (
  state: PaymentsHistoryState,
  data: PaymentHistory,
  newAttempt: boolean = false
): PaymentsHistoryState => {
  const currentAttempt = state.ongoingPayment?.attempt || 0;
  const updatedOngoingPaymentHistory: PaymentHistory = {
    ...state.ongoingPayment,
    ...data,
    attempt: newAttempt ? currentAttempt + 1 : currentAttempt
  };

  if (newAttempt) {
    return {
      analyticsData: state.analyticsData,
      ongoingPayment: updatedOngoingPaymentHistory,
      archive: appendItemToArchive(state.archive, updatedOngoingPaymentHistory),
      receiptsOpened: state.receiptsOpened,
      PDFsOpened: state.PDFsOpened,
      paymentsOngoingFailed: state.paymentsOngoingFailed
    };
  }

  return {
    analyticsData: state.analyticsData,
    ongoingPayment: updatedOngoingPaymentHistory,
    archive: [..._.dropRight(state.archive), updatedOngoingPaymentHistory],
    receiptsOpened: state.receiptsOpened,
    PDFsOpened: state.PDFsOpened,
    paymentsOngoingFailed: state.paymentsOngoingFailed
  };
};

const CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "paymentHistory",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_HISTORY_STORE_VERSION,
  whitelist: ["archive", "receiptsOpened", "paymentsOngoingFailed"],
  transforms: [createSetTransform(["receiptsOpened"])]
};

const walletPaymentHistoryPersistor = persistReducer<
  PaymentsHistoryState,
  Action
>(persistConfig, reducer);

export default walletPaymentHistoryPersistor;
