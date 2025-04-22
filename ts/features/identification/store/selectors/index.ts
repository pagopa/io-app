import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../store/reducers/types";

export const identificationFailSelector = (state: GlobalState) =>
  O.fromNullable(state.identification.fail);

export const progressSelector = (state: GlobalState) =>
  state.identification.progress;
