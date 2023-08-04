import React from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import I18n from "../../../i18n";

const DSScreenOperationResult = () => (
  <OperationResultScreenContent
    pictogram="umbrellaNew"
    title={I18n.t("idpay.payment.result.failure.GENERIC.title")}
  />
);

export { DSScreenOperationResult };
