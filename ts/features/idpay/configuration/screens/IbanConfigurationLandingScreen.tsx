import {
  ButtonSolid,
  ContentWrapper,
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { useConfigurationMachineService } from "../xstate/provider";

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 90
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "flex-start"
  },
  textCenter: { textAlign: "center" }
});

const IbanConfigurationLanding = () => {
  const configurationMachine = useConfigurationMachineService();

  const customGoBack = () => configurationMachine.send({ type: "BACK" });

  useNavigationSwipeBackListener(() => {
    configurationMachine.send({ type: "BACK", skipNavigation: true });
  });

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

  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <View
        style={[
          IOStyles.flex,
          styles.mainContainer,
          IOStyles.horizontalContentPadding
        ]}
      >
        <Pictogram name="ibanCard" size={180} />
        <VSpacer size={32} />
        <View style={[IOStyles.horizontalContentPadding, styles.textContainer]}>
          <H3>{I18n.t("idpay.configuration.iban.landing.header")}</H3>
          <VSpacer size={16} />
          <Body style={styles.textCenter}>
            {I18n.t("idpay.configuration.iban.landing.body")}
          </Body>
          <Body color="blue" weight="SemiBold" onPress={present}>
            {I18n.t("idpay.configuration.iban.landing.bodyLink")}
          </Body>
        </View>
      </View>

      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () => configurationMachine.send({ type: "NEXT" })
          }
        }}
      />
      {bottomSheet}
    </BaseScreenComponent>
  );
};
export default IbanConfigurationLanding;
