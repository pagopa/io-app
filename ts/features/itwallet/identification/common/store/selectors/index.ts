import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../../store/reducers/types";

// TODO: remove after development
export const itwHasNfcFeatureSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.identification.hasNfcFeature, false);
