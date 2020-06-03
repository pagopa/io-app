import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import I18n from "../../../../i18n";

export const cancelButtonProps = (
  onPress: () => void,
  title?: string
): BlockButtonProps => {
  return {
    bordered: true,
    title: title ? title : I18n.t("global.buttons.cancel"),
    onPress
  };
};

export const confirmButtonProps = (
  onPress: () => void,
  title?: string
): BlockButtonProps => {
  return {
    primary: true,
    title: title ? title : I18n.t("global.buttons.confirm"),
    onPress
  };
};
