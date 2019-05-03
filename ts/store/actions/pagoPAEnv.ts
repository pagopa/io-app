import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Switch pagoPA environment
 */
export const setPagoPAEnvironmentAsQa = createStandardAction(
  "PAGOPA_ENV_AS_QA"
)<boolean>();

export type PagoPAEnvironmentActions = ActionType<
  typeof setPagoPAEnvironmentAsQa
>;
