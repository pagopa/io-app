import {
  ContentWrapper,
  IOButton,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { IOScrollViewActions } from "../../../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../../../components/ui/IOScrollViewWithLargeHeader";
import { openWebUrl } from "../../../../../../utils/url";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import {
  trackCieIdWizardScreen,
  trackWizardCieIdSelected
} from "../../analytics";
import { SpidLevel } from "../../utils";
import { useIOSelector, useIOStore } from "../../../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../../../../activeSessionLogin/store/selectors";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";

export const CIE_ID_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/cie-id/";
const SPID_LEVEL: SpidLevel = "SpidL2";

const CieIdWizard = () => {
  const store = useIOStore();
  const { error } = useIOToast();
  const { navigate } = useIONavigation();
  const label = I18n.t("authentication.wizards.cie_id_wizard.title");
  const { navigateToCieIdLoginScreen } = useNavigateToLoginMethod();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  useOnFirstRender(() => {
    void trackCieIdWizardScreen(isActiveSessionLogin ? "reauth" : "auth");
  });

  const screenActions = (): IOScrollViewActions => ({
    type: "TwoButtons",
    primary: {
      testID: "cie-id-wizard-login-with-cie-id",
      label: I18n.t(
        "authentication.wizards.cie_id_wizard.actions.primary.label"
      ),
      onPress: () => {
        const flow = isActiveSessionLogin ? "reauth" : "auth";
        void trackWizardCieIdSelected(store.getState(), SPID_LEVEL, flow);
        navigateToCieIdLoginScreen(SPID_LEVEL);
      }
    },
    secondary: {
      testID: "cie-id-wizard-navigate-to-cie-pin-wizard",
      label: I18n.t(
        "authentication.wizards.cie_id_wizard.actions.secondary.label"
      ),
      onPress: () =>
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.CIE_PIN_WIZARD
        })
    }
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label,
        accessibilityLabel: label
      }}
      description={I18n.t("authentication.wizards.cie_id_wizard.description")}
      actions={screenActions()}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <IOButton
          variant="link"
          testID="cie-id-wizard-open-cie-id-link"
          onPress={() => {
            openWebUrl(CIE_ID_LINK, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
          label={I18n.t("authentication.wizards.cie_id_wizard.link")}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default CieIdWizard;
