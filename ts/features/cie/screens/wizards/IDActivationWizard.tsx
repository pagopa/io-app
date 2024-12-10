import {
  ContentWrapper,
  H6,
  ListItemAction,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useEffect } from "react";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { openWebUrl } from "../../../../utils/url";
import { trackIdpActivationWizardScreen } from "../../analytics";

export const REQUEST_CIE_URL =
  "https://www.cartaidentita.interno.gov.it/richiedi/";
export const ACTIVATE_CIE_URL =
  "https://www.cartaidentita.interno.gov.it/attiva/";
export const ACTIVATE_SPID_URL = "https://www.spid.gov.it/cittadini/";

const IDActivationWizard = () => {
  const { popToTop } = useIONavigation();
  const { error } = useIOToast();
  const label = I18n.t("authentication.wizards.id_activation_wizard.title");

  useEffect(() => {
    void trackIdpActivationWizardScreen();
  }, []);

  const handleOpenLink = (url: string) => () => {
    openWebUrl(url, () => {
      error(I18n.t("global.jserror.title"));
    });
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label,
        accessibilityLabel: label
      }}
      description={I18n.t(
        "authentication.wizards.id_activation_wizard.description"
      )}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(
            "authentication.wizards.id_activation_wizard.actions.primary.label"
          ),
          onPress: popToTop
        }
      }}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <H6>
          {I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.title"
          )}
        </H6>
        <VSpacer size={12} />
        <ListItemAction
          icon="cieLetter"
          label={I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.request_cie.label"
          )}
          variant="primary"
          testID="id-activation-request-cie"
          onPress={handleOpenLink(REQUEST_CIE_URL)}
        />
        <ListItemAction
          icon="cie"
          label={I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.activate_cie.title"
          )}
          variant="primary"
          testID="id-activation-activate-cie"
          onPress={handleOpenLink(ACTIVATE_CIE_URL)}
        />
        <ListItemAction
          icon="spid"
          label={I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.activate_spid.title"
          )}
          variant="primary"
          testID="id-activation-activate-spid"
          onPress={handleOpenLink(ACTIVATE_SPID_URL)}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default IDActivationWizard;
