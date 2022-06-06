import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";

export const loadingButtonProps = (): BlockButtonProps => ({
  block: true,
  onPress: undefined,
  title: "",
  disabled: true,
  style: { backgroundColor: IOColors.greyLight, width: "100%" },
  isLoading: true,
  iconColor: IOColors.bluegreyDark
});

export const continueButtonProps = (onPress: () => void): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("wallet.continue")
});

export const helpButtonProps = (onPress: () => void): BlockButtonProps => ({
  block: true,
  onPress,
  title: I18n.t("payment.details.info.buttons.help")
});
