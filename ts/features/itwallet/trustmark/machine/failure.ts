import { Errors } from "@pagopa/io-react-native-wallet";
import { TrustmarkEvents } from "./events";

const { isWalletProviderResponseError } = Errors;

export enum TrustmarkFailureType {
  UNEXPECTED = "UNEXPECTED",
  WALLET_PROVIDER_GENERIC = "WALLET_PROVIDER_GENERIC"
}

export type TrustmarkFailure = {
  type: TrustmarkFailureType;
  reason: unknown;
};

export const mapEventToFailure = (event: TrustmarkEvents): TrustmarkFailure => {
  if (!("error" in event)) {
    return {
      type: TrustmarkFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (isWalletProviderResponseError(error)) {
    return {
      type: TrustmarkFailureType.WALLET_PROVIDER_GENERIC,
      reason: String(error)
    };
  }

  return {
    type: TrustmarkFailureType.UNEXPECTED,
    reason: String(error)
  };
};
