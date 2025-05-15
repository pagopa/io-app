import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

export const itwIsNfcEnabledSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.identification.isNfcEnabled, false);
