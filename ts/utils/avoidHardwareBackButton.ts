import { useHardwareBackButton } from "../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";

export const avoidHardwareBackButton = () => useHardwareBackButton(() => true);
