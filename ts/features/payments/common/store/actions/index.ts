import { ActionType, createAsyncAction } from "typesafe-actions";
import { PaymentsMethodDetailsActions } from "../../../details/store/actions";
import { PaymentsHistoryActions } from "../../../history/store/actions";
import { PaymentsOnboardingActions } from "../../../onboarding/store/actions";
import { PaymentsCheckoutActions } from "../../../checkout/store/actions";
import { PaymentsTransactionActions } from "../../../transaction/store/actions";
import { PaymentsHomeActions } from "../../../home/store/actions";
import { PaymentsWalletActions } from "../../../wallet/store/actions";
import { PaymentsTransactionBizEventsActions } from "../../../bizEventsTransaction/store/actions";

import { NetworkError } from "../../../../../utils/errors";
import { SessionTokenResponse } from "../../../../../../definitions/pagopa/platform/SessionTokenResponse";

export const paymentsGetPagoPaPlatformSessionTokenAction = createAsyncAction(
  "PAYMENTS_GET_NEW_SESSION_TOKEN_REQUEST",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_SUCCESS",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_FAILURE"
)<undefined, SessionTokenResponse, NetworkError>();

export type PaymentsActions =
  | ActionType<typeof paymentsGetPagoPaPlatformSessionTokenAction>
  | PaymentsOnboardingActions
  | PaymentsMethodDetailsActions
  | PaymentsCheckoutActions
  | PaymentsTransactionActions
  | PaymentsHistoryActions
  | PaymentsHomeActions
  | PaymentsWalletActions
  | PaymentsTransactionBizEventsActions;
