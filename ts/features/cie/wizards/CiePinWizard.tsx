import React from "react";
import {
  ContentWrapper,
  LabelLink,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../components/IOMarkdown";
import useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import { IOScrollViewActions } from "../../../components/ui/IOScrollView";
import { openWebUrl } from "../../../utils/url";

const CIE_PIN_LINK =
  "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/";

const CiePinWizard = () => {
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
        <LabelLink
          onPress={() => {
            openWebUrl(CIE_PIN_LINK, () => {
              error(I18n.t("global.jserror.title"));
            });
          }}
        >
          {I18n.t("authentication.wizards.cie_pin_wizard.bottom_sheet.link")}
        </LabelLink>
      </>
    ),
    snapPoint: [350]
  });

  // eslint-disable-next-line arrow-body-style
  useFocusEffect(() => {
    return () => {
      dismiss();
    };
  });

  const getActions = (): IOScrollViewActions => {
    const primaryLabel = I18n.t(
      "authentication.wizards.cie_pin_wizard.actions.primary.label"
    );
    const secondaryLabel = I18n.t(
      "authentication.wizards.cie_pin_wizard.actions.secondary.label"
    );
    return {
      type: "TwoButtons",
      primary: {
        label: primaryLabel,
        accessibilityLabel: primaryLabel,
        onPress: navigateToCiePinInsertion
      },
      secondary: {
        label: secondaryLabel,
        accessibilityLabel: secondaryLabel,
        onPress: () => {
          navigate(ROUTES.AUTHENTICATION, {
            screen: ROUTES.AUTHENTICATION_SPID_WIZARD
          });
        }
      }
    };
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{ label, accessibilityLabel: label }}
      description={I18n.t("authentication.wizards.cie_pin_wizard.description")}
      actions={getActions()}
    >
      <ContentWrapper>
        <VSpacer size={12} />
        <LabelLink role="button" accessibilityRole="button" onPress={present}>
          {I18n.t(
            "authentication.wizards.cie_pin_wizard.bottom_sheet.cta.label"
          )}
        </LabelLink>
      </ContentWrapper>
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default CiePinWizard;
