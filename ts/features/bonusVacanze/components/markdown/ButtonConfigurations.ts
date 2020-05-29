import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import I18n from "../../../../i18n";

export const cancelButtonProps = (onPress: () => void): BlockButtonProps => {
  return {
    bordered: true,
    title: I18n.t("global.buttons.cancel"),
    onPress
  };
};

export const confirmButtonProps = (
  title: string,
  onPress: () => void
): BlockButtonProps => {
  return {
    primary: true,
    title,
    onPress
  };
};
