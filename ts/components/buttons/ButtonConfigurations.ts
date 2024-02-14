import { IOColors, IOIcons } from "@pagopa/io-app-design-system";
import { BlockButtonProps } from "../ui/BlockButtons";
import I18n from "../../i18n";

/**
 * A common configuration for all the buttons that represent a cancel/abort action
 * @param onPress
 * @param title
 * @param iconName
 * @param testID
 */
export const cancelButtonProps = (
  onPress: () => void,
  title?: string,
  iconName?: IOIcons,
  testID?: string
): BlockButtonProps => ({
  bordered: true,
  labelColor: IOColors.blue,
  title: title ? title : I18n.t("global.buttons.cancel"),
  iconName,
  onPress,
  testID
});
/**
 * A common configuration for all the buttons that represent a confirm/active action
 * @param onPress
 * @param title
 * @param iconName
 * @param testID
 */
export const confirmButtonProps = (
  onPress: () => void,
  title?: string,
  iconName?: IOIcons,
  testID?: string,
  disabled?: boolean,
  buttonFontSize?: number
): BlockButtonProps => ({
  primary: true,
  labelColor: IOColors.white,
  title: title ? title : I18n.t("global.buttons.confirm"),
  buttonFontSize,
  iconName,
  onPress,
  testID,
  disabled
});

/**
 * Style for error props
 * @param onPress
 * @param title
 */
export const errorButtonProps = (
  onPress: () => void,
  title?: string,
  iconName?: IOIcons
): BlockButtonProps => ({
  alert: true,
  labelColor: IOColors.white,
  title: title ?? I18n.t("global.buttons.confirm"),
  iconName,
  onPress
});

/**
 * Style for error props
 * @param onPress
 * @param title
 */
export const errorBorderedButtonProps = (
  onPress: () => void,
  title?: string,
  iconName?: IOIcons
): BlockButtonProps => ({
  title: title ?? I18n.t("global.buttons.confirm"),
  iconName,
  onPress,
  style: {
    flex: 1,
    borderColor: IOColors.red
  },
  onPressWithGestureHandler: true,
  labelColor: IOColors.red,
  bordered: true
});

/**
 * A common configuration for all the buttons that represent a confirm/active action (disabled)
 * @param onPress
 * @param title
 */
export const disablePrimaryButtonProps = (
  title?: string,
  iconName?: IOIcons,
  testID?: string
): BlockButtonProps => ({
  primary: true,
  disabled: true,
  title: title ? title : I18n.t("global.buttons.confirm"),
  iconName,
  testID
});
