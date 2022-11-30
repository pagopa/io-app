import * as React from "react";
import genericError from "../../../../img/wallet/errors/generic-error-icon.png";
import I18n from "../../../i18n";
import ErrorComponent from "./ErrorComponent";

const GenericErrorComponent = () => (
  <ErrorComponent
    title={I18n.t("features.fci.errors.generic.title")}
    subTitle={I18n.t("features.fci.errors.generic.subTitle")}
    image={genericError}
    testID={"GenericErrorComponentTestID"}
  />
);

export default GenericErrorComponent;
