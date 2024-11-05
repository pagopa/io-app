import React, { useRef } from "react";
import {
  ButtonLink,
  ContentWrapper,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../../components/IOMarkdown";
import useNavigateToLoginMethod from "../../../../hooks/useNavigateToLoginMethod";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { openWebUrl } from "../../../../utils/url";
import { setAccessibilityFocus } from "../../../../utils/accessibility";

const CIE_PIN_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/";

const CiePinWizard = () => {
  const buttonRef = useRef<View>(null);
  const { navigate } = useIONavigation();
  const { error } = useIOToast();
  const { navigateToCiePinInsertion } = useNavigateToLoginMethod();
  const label = I18n.t("authentication.wizards.cie_pin_wizard.title");

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
        <ButtonLink
          label={I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.link"
          )}
          onPress={() => {
            openWebUrl(CIE_PIN_LINK, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
        />
      </>
    ),
    snapPoint: [350],
    onDismiss: () => {
      setAccessibilityFocus(buttonRef);
    }
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
      label: I18n.t(
        "authentication.wizards.cie_pin_wizard.actions.primary.label"
      ),
      onPress: navigateToCiePinInsertion
    },
    secondary: {
      label: I18n.t(
        "authentication.wizards.cie_pin_wizard.actions.secondary.label"
      ),
      onPress: () => {
        navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.AUTHENTICATION_SPID_WIZARD
        });
      }
    }
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{ label, accessibilityLabel: label }}
      description={I18n.t("authentication.wizards.cie_pin_wizard.description")}
      actions={screenActions()}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <ButtonLink
          label={I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.cta.label"
          )}
          ref={buttonRef}
          onPress={present}
        />
      </ContentWrapper>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default CiePinWizard;
