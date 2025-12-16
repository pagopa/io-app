import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

export const isUnsubscriptionSuccessSelector = (state: GlobalState) =>
  pot.isSome(state.features.idPay.unsubscription);

export const isLoadingSelector = (state: GlobalState) =>
  pot.isLoading(state.features.idPay.unsubscription);

export const isFailureSelector = (state: GlobalState) =>
  pot.isError(state.features.idPay.unsubscription);
