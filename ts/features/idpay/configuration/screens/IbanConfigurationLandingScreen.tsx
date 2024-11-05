import {
  ButtonSolid,
  ContentWrapper,
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isSettingsVisibleAndHideProfileSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { IdPayConfigurationMachineContext } from "../machine/provider";

export const IbanConfigurationLanding = () => {
  const { useActorRef } = IdPayConfigurationMachineContext;
  const machine = useActorRef();
  const isSettingsVisibleAndHideProfile = useIOSelector(
    isSettingsVisibleAndHideProfileSelector
  );

  const customGoBack = () => machine.send({ type: "back" });

  const { bottomSheet, dismiss, present } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("idpay.configuration.iban.landing.modal.title"),
      component: (
        <Body>
          {isSettingsVisibleAndHideProfile
            ? I18n.t("idpay.configuration.iban.landing.modal.content")
            : I18n.t("idpay.configuration.iban.landing.modal.legacyContent")}
        </Body>
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
          <Body color="blue" weight="Semibold" onPress={present}>
            {I18n.t("idpay.configuration.iban.landing.bodyLink")}
          </Body>
        </View>
      </View>

      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.continue"),
              onPress: () => machine.send({ type: "next" })
            }
          }}
        />
      </SafeAreaView>
      {bottomSheet}
    </BaseScreenComponent>
  );
};

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
