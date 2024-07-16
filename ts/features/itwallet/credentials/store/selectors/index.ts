import { GlobalState } from "../../../../../store/reducers/types";

export const itwCredentialsEidSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.eid;
