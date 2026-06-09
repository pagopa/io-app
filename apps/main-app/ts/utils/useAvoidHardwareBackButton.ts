import { useHardwareBackButton } from "../hooks/useHardwareBackButton";

export const useAvoidHardwareBackButton = () =>
  useHardwareBackButton(() => true);
