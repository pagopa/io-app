import I18n from "../../../../i18n";
import { actionWithAlert } from "./ActionWithAlert";

export const confirmBonusActivation = (onConfirm: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanza.eligibility.activate.confirm.title"),
    body: I18n.t("bonus.bonusVacanza.eligibility.activate.confirm.body"),
    confirmText: I18n.t(
      "bonus.bonusVacanza.eligibility.activate.confirm.confirm"
    ),
    cancelText: I18n.t(
      "bonus.bonusVacanza.eligibility.activate.confirm.cancel"
    ),
    onConfirmAction: onConfirm
  });
