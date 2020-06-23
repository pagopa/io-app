import I18n from "../../../../i18n";
import { actionWithAlert } from "./ActionWithAlert";

export const confirmBonusActivation = (onConfirm: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanza.activation.confirm.title"),
    body: I18n.t("bonus.bonusVacanza.activation.confirm.body"),
    confirmText: I18n.t("bonus.bonusVacanza.activation.confirm.confirm"),
    cancelText: I18n.t("bonus.bonusVacanza.activation.confirm.cancel"),
    onConfirmAction: onConfirm
  });
