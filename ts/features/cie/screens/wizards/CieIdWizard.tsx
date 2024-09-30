import {
  ContentWrapper,
  Label,
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

const CIE_ID_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/cie-id/";

const CieIdWizard = () => {
  const { error, info } = useIOToast();
  const { navigate } = useIONavigation();
  const label = I18n.t("authentication.wizards.cie_id_wizard.title");

  const getActions = (): IOScrollViewActions => {
    const primaryLabel = I18n.t(
      "authentication.wizards.cie_id_wizard.actions.primary.label"
    );
    const secondaryLabel = I18n.t(
      "authentication.wizards.cie_id_wizard.actions.secondary.label"
    );
    return {
      type: "TwoButtons",
      primary: {
        label: primaryLabel,
        accessibilityLabel: primaryLabel,
        onPress: () => {
          // Depends on https://pagopa.atlassian.net/browse/IOPID-2134
          // TODO: navigate to CieID login
          info("Not implemented yet...");
        }
      },
      secondary: {
        label: secondaryLabel,
        accessibilityLabel: secondaryLabel,
        onPress: () =>
          navigate(ROUTES.AUTHENTICATION, {
            screen: ROUTES.AUTHENTICATION_CIE_PIN_WIZARD
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
      description={I18n.t("authentication.wizards.cie_id_wizard.description")}
      actions={getActions()}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <Label
          asLink
          onPress={() => {
            openWebUrl(CIE_ID_LINK, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
        >
          {I18n.t("authentication.wizards.cie_id_wizard.link")}
        </Label>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default CieIdWizard;
