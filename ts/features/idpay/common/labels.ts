import { StatusEnum } from "../../../../definitions/idpay/InstrumentDTO";
import I18n from "../../../i18n";

type InstrumentStatusLabels = {
  [key in StatusEnum]: string;
};

const instrumentStatusLabels: InstrumentStatusLabels = {
  [StatusEnum.ACTIVE]: I18n.t(
    "idpay.configuration.instruments.instrumentStatus.active"
  ),
  [StatusEnum.PENDING_ENROLLMENT_REQUEST]: I18n.t(
    "idpay.configuration.instruments.instrumentStatus.pendingActivation"
  ),
  [StatusEnum.PENDING_DEACTIVATION_REQUEST]: I18n.t(
    "idpay.configuration.instruments.instrumentStatus.pendingDeactivation"
  )
};

export { instrumentStatusLabels };
