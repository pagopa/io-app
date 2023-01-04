import I18n from "../../../../../i18n";
import { actionWithAlert } from "../../../common/components/alert/ActionWithAlert";

export const abortBonusRequest = (onAbort: () => void) =>
  actionWithAlert({
    title: I18n.t("bonus.bonusVacanze.abort.title"),
    body: I18n.t("bonus.bonusVacanze.abort.body"),
    confirmText: I18n.t("bonus.bonusVacanze.abort.confirm"),
    cancelText: I18n.t("bonus.bonusVacanze.abort.cancel"),
    completedFeedbackText: I18n.t("bonus.bonusVacanze.abort.completed"),
    onConfirmAction: onAbort
  });
