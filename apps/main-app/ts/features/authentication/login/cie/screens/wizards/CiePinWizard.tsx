import {
  ContentWrapper,
  IOButton,
  IOMarkdown,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useRef } from "react";
import { View } from "react-native";

import { IOScrollViewActions } from "../../../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../../utils/accessibility";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../../../utils/url";
import { isActiveSessionLoginSelector } from "../../../../activeSessionLogin/store/selectors";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import {
  trackCiePinWizardScreen,
  trackWizardCiePinInfoSelected,
  trackWizardCiePinSelected
} from "../../analytics";

export const CIE_PIN_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/";

const CiePinWizard = () => {
  const buttonRef = useRef<View>(null);
  const store = useIOStore();
  const { navigate } = useIONavigation();
  const { error } = useIOToast();
  const { navigateToCiePinInsertion } = useNavigateToLoginMethod();
  const label = I18n.t("authentication.wizards.cie_pin_wizard.title");
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const flow = isActiveSessionLogin ? "reauth" : "auth";

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t("authentication.wizards.cie_pin_wizard.bottom_sheet.title"),
    component: (
      <>
        <IOMarkdown
          content={I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.content"
          )}
        />
        <VSpacer size={24} />
        <IOButton
          label={I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.link"
          )}
          onPress={() => {
            openWebUrl(CIE_PIN_LINK, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
          testID="cie-pin-wizard-open-cie-pin-link"
          variant="link"
        />
      </>
    ),
    snapPoint: [350],
    onDismiss: () => {
      setAccessibilityFocus(buttonRef);
    }
  });

  useOnFirstRender(() => {
    void trackCiePinWizardScreen(flow);
  });

  // eslint-disable-next-line arrow-body-style
  useFocusEffect(() => {
    return () => {
      dismiss();
    };
  });

  const screenActions = (): IOScrollViewActions => ({
    type: "TwoButtons",
    primary: {
      testID: "cie-pin-wizard-navigate-to-cie-pin-screen",
      label: I18n.t(
        "authentication.wizards.cie_pin_wizard.actions.primary.label"
      ),
      onPress: () => {
        void trackWizardCiePinSelected(store.getState(), flow);
        navigateToCiePinInsertion();
      }
    },
    secondary: {
      testID: "cie-pin-wizard-navigate-to-spid-wizard",
      label: I18n.t(
        "authentication.wizards.cie_pin_wizard.actions.secondary.label"
      ),
      onPress: () => {
        navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.SPID_WIZARD
        });
      }
    }
  });

  const handlePresent = () => {
    void trackWizardCiePinInfoSelected(flow);
    present();
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={screenActions()}
      description={I18n.t("authentication.wizards.cie_pin_wizard.description")}
      title={{ label, accessibilityLabel: label }}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <IOButton
          label={I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.cta.label"
          )}
          onPress={handlePresent}
          ref={buttonRef}
          testID="cie-pin-wizard-open-bottom-sheet"
          variant="link"
        />
      </ContentWrapper>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default CiePinWizard;
