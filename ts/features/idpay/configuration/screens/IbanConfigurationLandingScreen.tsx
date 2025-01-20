import {
  Body,
  ButtonSolid,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { IdPayConfigurationMachineContext } from "../machine/provider";

export const IbanConfigurationLanding = () => {
  const { useActorRef } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const customGoBack = () => machine.send({ type: "back" });

  const { bottomSheet, dismiss, present } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("idpay.configuration.iban.landing.modal.title"),
      component: (
        <Body>{I18n.t("idpay.configuration.iban.landing.modal.content")}</Body>
      ),
      footer: (
        <ContentWrapper>
          <ButtonSolid
            label={I18n.t("idpay.configuration.iban.landing.modal.button")}
            accessibilityLabel={I18n.t(
              "idpay.configuration.iban.landing.modal.button"
            )}
            onPress={() => dismiss()}
            fullWidth={true}
          />
          <VSpacer size={32} />
        </ContentWrapper>
      )
    },
    130
  );

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
              <Body color="blue" weight="Semibold" onPress={present}>
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
