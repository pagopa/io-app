import { StatusEnum } from "@io-app/api-types/generated/definitions/idpay/InstrumentDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";

type InstrumentStatusLabels = {
  [key in StatusEnum]: string;
};

/**
 * Resolves the label at call time, so it follows the language currently
 * selected by the user instead of the one active when this module loaded.
 */
const getInstrumentStatusLabel = (status: StatusEnum): string => {
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

  return instrumentStatusLabels[status];
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
  "10": "PrivateCircuit"
};

export const getLabelForCircuitType = (circuitType: string | undefined) =>
  pipe(
    circuitType,
    O.fromNullable,
    O.chain(type => O.fromNullable(circuitTypeLabels[type])),
    O.getOrElse(() => "-")
  );

export { getInstrumentStatusLabel };
