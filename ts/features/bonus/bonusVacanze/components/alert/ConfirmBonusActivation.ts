import I18n from "../../../../../i18n";
import { actionWithAlert } from "../../../common/components/alert/ActionWithAlert";

export const confirmBonusActivation = (onConfirm: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanze.activation.confirm.title"),
    body: I18n.t("bonus.bonusVacanze.activation.confirm.body"),
    confirmText: I18n.t("bonus.bonusVacanze.activation.confirm.confirm"),
    cancelText: I18n.t("bonus.bonusVacanze.activation.confirm.cancel"),
    onConfirmAction: onConfirm
  });
