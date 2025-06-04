import { GlobalState } from "../../../../../store/reducers/types";

export const selectItwEnv = (state: GlobalState) =>
  state.features.itWallet.environment.env ?? "prod";
