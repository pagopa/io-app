import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../../store/reducers/types";

export const itwHasNfcFeatureSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.identification.hasNfcFeature, false);
