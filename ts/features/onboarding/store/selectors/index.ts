import { GlobalState } from "../../../../store/reducers/types";

export const isFingerprintAcknowledgedSelector = (
  state: GlobalState
): boolean => state.onboarding.isFingerprintAcknowledged;
