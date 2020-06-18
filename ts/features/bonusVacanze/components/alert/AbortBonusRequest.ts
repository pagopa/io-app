import I18n from "../../../../i18n";
import { actionWithAlert } from "./ActionWithAlert";

export const abortBonusRequest = (onAbort: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanza.abort.title"),
    body: I18n.t("bonus.bonusVacanza.abort.body"),
    confirmText: I18n.t("bonus.bonusVacanza.abort.confirm"),
    cancelText: I18n.t("bonus.bonusVacanza.abort.cancel"),
    completedFeedbackText: I18n.t("bonus.bonusVacanza.abort.completed"),
    onConfirmAction: onAbort
  });
