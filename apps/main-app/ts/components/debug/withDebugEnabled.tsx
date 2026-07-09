import { useIOSelector } from "../../store/hooks";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";

/** Returns true when debug mode is enabled. */
export const useDebugEnabled = () => useIOSelector(isDebugModeEnabledSelector);
