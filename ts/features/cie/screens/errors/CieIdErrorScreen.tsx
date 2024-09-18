import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import useNavigateToLoginMethod from "../../../../hooks/useNavigateToLoginMethod";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { TranslationKeys } from "../../../../../locales/locales";

const CIE_PIN_DESC: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_supported.description";
const CIE_PIN_ACTION_LABEL: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_supported.primary_action_label";
const SPID_DESC: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_not_supported.description";
const SPID_ACTION_LABEL: TranslationKeys =
  "authentication.cie_id.error_screen.cie_pin_not_supported.primary_action_label";

const CieIdErrorScreen = () => {
  const { navigateToIdpSelection, navigateToCiePinInsertion, isCieSupported } =
    useNavigateToLoginMethod();
  const { popToTop } = useIONavigation();

  const subtitle = I18n.t(isCieSupported ? CIE_PIN_DESC : SPID_DESC);
  const primaryActionLabel = I18n.t(
    isCieSupported ? CIE_PIN_ACTION_LABEL : SPID_ACTION_LABEL
  );
  const secondaryActionLabel = I18n.t(
    "authentication.cie_id.error_screen.secondary_action_label"
  );

  return (
    <OperationResultScreenContent
      title={I18n.t("authentication.cie_id.error_screen.title")}
      subtitle={subtitle}
      pictogram="help"
      action={{
        label: primaryActionLabel,
        onPress: isCieSupported
          ? navigateToCiePinInsertion
          : navigateToIdpSelection
      }}
      secondaryAction={{
        label: secondaryActionLabel,
        onPress: popToTop
      }}
    />
  );
};

export default CieIdErrorScreen;
