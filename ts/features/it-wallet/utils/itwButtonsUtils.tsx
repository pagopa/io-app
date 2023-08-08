import I18n from "../../../i18n";

export const cancelButtonProps = (onPress: () => void) => ({
  block: true,
  light: false,
  bordered: true,
  onPress,
  title: I18n.t("features.itWallet.generic.close")
});
