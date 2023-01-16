import { StatusEnum } from "../../../../definitions/idpay/wallet/InstrumentDTO";
import I18n from "../../../i18n";

type InstrumentStatusLabels = {
  [key in StatusEnum]: string;
};

const instrumentStatusLabels: InstrumentStatusLabels = {
  [StatusEnum.ACTIVE]: I18n.t(
    "idpay.initiative.configuration.cardLabels.active"
  ),
  [StatusEnum.PENDING_ENROLLMENT_REQUEST]: I18n.t(
    "idpay.initiative.configuration.cardLabels.pendingActivation"
  ),
  [StatusEnum.PENDING_DEACTIVATION_REQUEST]: I18n.t(
    "idpay.initiative.configuration.cardLabels.pendingDeactivation"
  )
};

export { instrumentStatusLabels };
