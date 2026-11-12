import { useIOColors } from "@io-app/design-system";

export const useItwStatusIconColor = (expired: boolean) => {
  const colors = useIOColors();
  return expired ? colors.icon.decorative : colors.icon.action;
};
