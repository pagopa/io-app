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

/**
 * Style for error props
 * @param onPress
 * @param title
 */
export const errorButtonProps = (
  onPress: () => void,
  title?: string
): BlockButtonProps => ({
  alert: true,
  title: title ?? I18n.t("global.buttons.confirm"),
  onPress
});

/**
 * A common configuration for all the buttons that represent a confirm/active action (disabled)
 * @param onPress
 * @param title
 */
export const disablePrimaryButtonProps = (
  title?: string
): BlockButtonProps => ({
  primary: true,
  disabled: true,
  title: title ? title : I18n.t("global.buttons.confirm")
});
