import { ActionType, createStandardAction } from "typesafe-actions";

export const paymentsSetAddMethodsBannerVisible = createStandardAction(
  "PAYMENTS_SET_ADD_METHODS_BANNER_VISIBLE"
)<boolean>();

export type PaymentsHomeActions = ActionType<
  typeof paymentsSetAddMethodsBannerVisible
>;
