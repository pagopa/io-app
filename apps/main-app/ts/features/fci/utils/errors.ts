import { GenericError, TimeoutError } from "../../../utils/errors.ts";

export type ExpiredError = { readonly kind: "expired" };
export type FciNetworkError = TimeoutError | GenericError | ExpiredError;
