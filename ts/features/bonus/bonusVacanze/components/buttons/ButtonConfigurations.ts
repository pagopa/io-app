import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import I18n from "../../../../../i18n";

/**
 * A common configuration for all the buttons that represent a cancel/abort action
 * @param onPress
 * @param title
 */
export const cancelButtonProps = (
  onPress: () => void,
  title?: string
): BlockButtonProps => ({
  bordered: true,
  title: title ? title : I18n.t("global.buttons.cancel"),
  onPress
});
/**
 * A common configuration for all the buttons that represent a confirm/active action
 * @param onPress
 * @param title
 */
export const confirmButtonProps = (
  onPress: () => void,
  title?: string
): BlockButtonProps => ({
  primary: true,
  title: title ? title : I18n.t("global.buttons.confirm"),
  onPress
});
