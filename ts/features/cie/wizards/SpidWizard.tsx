import React from "react";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { IOScrollViewActions } from "../../../components/ui/IOScrollView";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";

const SpidWizard = () => {
  const { navigate } = useIONavigation();
  const { navigateToIdpSelection } = useNavigateToLoginMethod();
  const label = I18n.t("authentication.wizards.spid_wizard.title");

  const getActions = (): IOScrollViewActions => {
    const primaryLabel = I18n.t(
      "authentication.wizards.spid_wizard.actions.primary.label"
    );
    const secondaryLabel = I18n.t(
      "authentication.wizards.spid_wizard.actions.secondary.label"
    );
    return {
      type: "TwoButtons",
      primary: {
        label: primaryLabel,
        accessibilityLabel: primaryLabel,
        onPress: navigateToIdpSelection
      },
      secondary: {
        label: secondaryLabel,
        accessibilityLabel: secondaryLabel,
        onPress: () =>
          navigate(ROUTES.AUTHENTICATION, {
            screen: ROUTES.AUTHENTICATION_ID_ACTIVATION_WIZARD
          })
      }
    };
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label,
        accessibilityLabel: label
      }}
      description={I18n.t("authentication.wizards.spid_wizard.description")}
      actions={getActions()}
    />
  );
};

export default SpidWizard;
