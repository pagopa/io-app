import { IOToast } from "@io-app/design-system";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { GlobalState } from "../../../../store/reducers/types";

/**
 * Navigation surface used by IT Wallet machines.
 * Providers can pass the full `useIONavigation()` result.
 */
export type MachineNavigation = Pick<
  IONavigation,
  | "canGoBack"
  | "getState"
  | "goBack"
  | "navigate"
  | "pop"
  | "popToTop"
  | "replace"
  | "reset"
>;

/**
 * Redux store surface used by IT Wallet machines.
 * Providers can pass the full `useIOStore()` result.
 */
export type MachineStore = {
  dispatch(action: unknown): unknown;
  getState(): GlobalState;
  subscribe(listener: () => void): () => void;
};

/**
 * Toast surface used by IT Wallet machines.
 * Providers can pass the full `useIOToast()` result.
 */
export type MachineToast = Pick<IOToast, "error" | "success">;

type IONavigation = ReturnType<typeof useIONavigation>;
