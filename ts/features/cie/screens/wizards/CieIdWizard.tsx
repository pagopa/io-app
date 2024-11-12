import {
  ButtonLink,
  ContentWrapper,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import ROUTES from "../../../../navigation/routes";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { openWebUrl } from "../../../../utils/url";
import useNavigateToLoginMethod from "../../../../hooks/useNavigateToLoginMethod";

export const CIE_ID_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/cie-id/";

const CieIdWizard = () => {
  const { error } = useIOToast();
  const { navigate } = useIONavigation();
  const label = I18n.t("authentication.wizards.cie_id_wizard.title");
  const { navigateToCieIdLoginScreen } = useNavigateToLoginMethod();

  const screenActions = (): IOScrollViewActions => ({
    type: "TwoButtons",
    primary: {
      testID: "cie-id-wizard-login-with-cie-id",
      label: I18n.t(
        "authentication.wizards.cie_id_wizard.actions.primary.label"
      ),
      onPress: () => {
        navigateToCieIdLoginScreen("SpidL2");
      }
    },
    secondary: {
      testID: "cie-id-wizard-navigate-to-cie-pin-wizard",
      label: I18n.t(
        "authentication.wizards.cie_id_wizard.actions.secondary.label"
      ),
      onPress: () =>
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_CIE_PIN_WIZARD
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
        <ButtonLink
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
