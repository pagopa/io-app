import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../../store/reducers/types";

// TODO: comment this for test purposes
export const itwHasNfcFeatureSelector = (state: GlobalState) =>
  pot.getOrElse(state.features.itWallet.identification.hasNfcFeature, false);
