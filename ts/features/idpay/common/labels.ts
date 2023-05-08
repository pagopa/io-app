import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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

type OperationTypeLabels = {
  [key: string]: string;
};

const circuitTypeLabels: OperationTypeLabels = {
  "00": "Bancomat",
  "01": "Visa",
  "02": "Mastercard",
  "03": "Amex",
  "04": "JCB",
  "05": "UnionPay",
  "06": "Diners",
  "07": "PostePay",
  "08": "BancomatPay",
  "09": "Satispay",
  "10": "PrivateCircuit"
};

export const getLabelForCircuitType = (circuitType: string) =>
  pipe(
    circuitType,
    O.some,
    O.chain(type => O.fromNullable(circuitTypeLabels[type])),
    O.getOrElse(() => "-")
  );

export { instrumentStatusLabels };
