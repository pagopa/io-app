import { pipe } from "fp-ts/lib/function";
import { GlobalState } from "../../../../store/reducers/types";

const selectWalletFeature = (state: GlobalState) => state.features.wallet;

export const isWalletPaymentsRedirectBannerVisibleSelector = (
  state: GlobalState
) =>
  pipe(
    state,
    selectWalletFeature,
    wallet => wallet.shouldShowPaymentsRedirectBanner
  );
