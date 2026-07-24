import {
  ContentWrapper,
  H6,
  ListItemAction,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";

import { IOScrollViewWithLargeHeader } from "../../../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../../../utils/url";
import { isActiveSessionLoginSelector } from "../../../../activeSessionLogin/store/selectors";
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
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  useOnFirstRender(() => {
    void trackIdpActivationWizardScreen(
      isActiveSessionLogin ? "reauth" : "auth"
    );
  });

  const handleOpenLink = (url: string) => () => {
    openWebUrl(url, () => {
      error(I18n.t("global.jserror.title"));
    });
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(
            "authentication.wizards.id_activation_wizard.actions.primary.label"
          ),
          onPress: popToTop
        }
      }}
      description={I18n.t(
        "authentication.wizards.id_activation_wizard.description"
      )}
      title={{
        label,
        accessibilityLabel: label
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
          onPress={handleOpenLink(REQUEST_CIE_URL)}
          testID="id-activation-request-cie"
          variant="primary"
        />
        <ListItemAction
          icon="cie"
          label={I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.activate_cie.title"
          )}
          onPress={handleOpenLink(ACTIVATE_CIE_URL)}
          testID="id-activation-activate-cie"
          variant="primary"
        />
        <ListItemAction
          icon="spid"
          label={I18n.t(
            "authentication.wizards.id_activation_wizard.list_items.activate_spid.title"
          )}
          onPress={handleOpenLink(ACTIVATE_SPID_URL)}
          testID="id-activation-activate-spid"
          variant="primary"
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default IDActivationWizard;
