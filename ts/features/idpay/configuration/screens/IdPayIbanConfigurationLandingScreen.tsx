import {
  Body,
  ContentWrapper,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/help";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { IdPayConfigurationMachineContext } from "../machine/provider";

export const IdPayIbanConfigurationLandingScreen = () => {
  const { useActorRef } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const customGoBack = () => machine.send({ type: "back" });

  const { bottomSheet, dismiss, present } = useIOBottomSheetModal({
    title: I18n.t("idpay.configuration.iban.landing.modal.title"),
    component: (
      <Body>{I18n.t("idpay.configuration.iban.landing.modal.content")}</Body>
    ),
    footer: (
      <ContentWrapper>
        <IOButton
          fullWidth
          variant="solid"
          label={I18n.t("idpay.configuration.iban.landing.modal.button")}
          onPress={() => dismiss()}
        />
        <VSpacer size={32} />
      </ContentWrapper>
    )
  });

  useHeaderSecondLevel({
    title: I18n.t("idpay.configuration.headerTitle"),
    goBack: customGoBack,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <>
      <OperationResultScreenContent
        pictogram="ibanCard"
        title={I18n.t("idpay.configuration.iban.landing.header")}
        isHeaderVisible
        subtitle={[
          {
            text: I18n.t("idpay.configuration.iban.landing.body")
          },
          {
            text: "\n"
          },
          {
            text: (
              <Body asLink weight="Semibold" onPress={present}>
                {I18n.t("idpay.configuration.iban.landing.bodyLink")}
              </Body>
            )
          }
        ]}
        action={{
          label: I18n.t("global.buttons.continue"),
          onPress: () => machine.send({ type: "next" })
        }}
      />
      {bottomSheet}
    </>
  );
};
