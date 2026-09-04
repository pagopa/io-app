import { GenericError, TimeoutError } from "../../../utils/errors.ts";

export type FciNetworkError = ExpiredError | GenericError | TimeoutError;
type ExpiredError = { readonly kind: "expired" };
