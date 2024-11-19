import React, { useEffect } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import useNavigateToLoginMethod from "../../../../hooks/useNavigateToLoginMethod";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  trackSpidWizardScreen,
  trackWizardSpidSelected
} from "../../analytics";

const SpidWizard = () => {
  const { navigate } = useIONavigation();
  const { navigateToIdpSelection } = useNavigateToLoginMethod();
  const label = I18n.t("authentication.wizards.spid_wizard.title");

  useEffect(() => {
    void trackSpidWizardScreen();
  }, []);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label,
        accessibilityLabel: label
      }}
      description={I18n.t("authentication.wizards.spid_wizard.description")}
      actions={{
        type: "TwoButtons",
        primary: {
          testID: "spid-wizard-navigate-to-idp-selection",
          label: I18n.t(
            "authentication.wizards.spid_wizard.actions.primary.label"
          ),
          onPress: () => {
            void trackWizardSpidSelected();
            navigateToIdpSelection();
          }
        },
        secondary: {
          testID: "spid-wizard-navigate-to-id-activation-wizard",
          label: I18n.t(
            "authentication.wizards.spid_wizard.actions.secondary.label"
          ),
          onPress: () =>
            navigate(ROUTES.AUTHENTICATION, {
              screen: ROUTES.AUTHENTICATION_ID_ACTIVATION_WIZARD
            })
        }
      }}
    />
  );
};

export default SpidWizard;
