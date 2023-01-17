import { StatusEnum } from "../../../../definitions/idpay/wallet/InstrumentDTO";
import I18n from "../../../i18n";

type InstrumentStatusLabels = {
  [key in StatusEnum]: string;
};

const instrumentStatusLabels: InstrumentStatusLabels = {
  [StatusEnum.ACTIVE]: I18n.t(
    "idpay.initiative.configuration.instrumentStatus.active"
  ),
  [StatusEnum.PENDING_ENROLLMENT_REQUEST]: I18n.t(
    "idpay.initiative.configuration.instrumentStatus.pendingActivation"
  ),
  [StatusEnum.PENDING_DEACTIVATION_REQUEST]: I18n.t(
    "idpay.initiative.configuration.instrumentStatus.pendingDeactivation"
  )
};

export { instrumentStatusLabels };
