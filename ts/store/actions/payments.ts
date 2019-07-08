import { ActionType, createStandardAction } from "typesafe-actions";
import { PaymentsLastDeletedInfo } from "../reducers/payments/lastDeleted";

export const paymentsLastDeletedSet = createStandardAction(
  "PAYMENTS_LAST_DELETED_SET"
)<PaymentsLastDeletedInfo>();

export type PaymentsActions = ActionType<typeof paymentsLastDeletedSet>;
