import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../../../components/ui/IOScrollViewWithLargeHeader";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import {
  trackSpidWizardScreen,
  trackWizardSpidSelected
} from "../../analytics";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { isActiveSessionLoginSelector } from "../../../../activeSessionLogin/store/selectors";
import { useIOSelector } from "../../../../../../store/hooks";

const SpidWizard = () => {
  const { navigate } = useIONavigation();
  const { navigateToIdpSelection } = useNavigateToLoginMethod();
  const label = I18n.t("authentication.wizards.spid_wizard.title");
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const flow = isActiveSessionLogin ? "reauth" : "auth";

  useOnFirstRender(() => {
    void trackSpidWizardScreen(flow);
  });

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
            void trackWizardSpidSelected(flow);
            navigateToIdpSelection();
          }
        },
        secondary: {
          testID: "spid-wizard-navigate-to-id-activation-wizard",
          label: I18n.t(
            "authentication.wizards.spid_wizard.actions.secondary.label"
          ),
          onPress: () =>
            navigate(AUTHENTICATION_ROUTES.MAIN, {
              screen: AUTHENTICATION_ROUTES.ID_ACTIVATION_WIZARD
            })
        }
      }}
    />
  );
};

export default SpidWizard;
