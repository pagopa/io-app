import { StatusEnum } from "../../../../definitions/idpay/wallet/InstrumentDTO";

type InstrumentStatusLabels = {
  [key in StatusEnum]: string;
};

// TODO: Add translations
const instrumentStatusLabels: InstrumentStatusLabels = {
  [StatusEnum.ACTIVE]: "Attivo",
  [StatusEnum.PENDING_ENROLLMENT_REQUEST]: "In attivazione",
  [StatusEnum.PENDING_DEACTIVATION_REQUEST]: "In disattivazione"
};

export { instrumentStatusLabels };
