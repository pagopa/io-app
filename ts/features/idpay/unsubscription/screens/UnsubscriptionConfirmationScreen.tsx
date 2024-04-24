import {
  ContentWrapper,
  FooterWithButtons,
  IconButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import LegacyFooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useConfirmationChecks } from "../../../../hooks/useConfirmationChecks";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { UnsubscriptionCheckListItem } from "../components/UnsubscriptionCheckListItem";
import { IdPayUnsubscriptionMachineContext } from "../machine/provider";
import {
  isLoadingSelector,
  selectInitiativeName,
  selectUnsubscriptionChecks
} from "../machine/selectors";

const UnsubscriptionConfirmationScreen = () => {
  const { useActorRef, useSelector } = IdPayUnsubscriptionMachineContext;

  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);
  const initiativeName = useSelector(selectInitiativeName);
  const unsubscriptionChecks = useSelector(selectUnsubscriptionChecks);

  const checks = useConfirmationChecks(unsubscriptionChecks.length);

  const handleClosePress = () =>
    machine.send({
      type: "exit"
    });

  const handleConfirmPress = () => {
    machine.send({
      type: "confirm-unsubscription"
    });
  };

  const closeButton = (
    <IconButton
      icon="closeLarge"
      color="neutral"
      onPress={handleClosePress}
      accessibilityLabel={I18n.t("global.buttons.close")}
    />
  );

  const confirmModal = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t("idpay.unsubscription.modal.title", { initiativeName }),
      component: (
        <View>
          <Body>{I18n.t("idpay.unsubscription.modal.content")}</Body>
          <VSpacer size={16} />
        </View>
      ),
      footer: (
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("idpay.unsubscription.button.continue"),
              accessibilityLabel: I18n.t(
                "idpay.unsubscription.button.continue"
              ),
              onPress: () => {
                confirmModal.dismiss();
                handleConfirmPress();
              },
              color: "danger"
            }
          }}
          secondary={{
            type: "Outline",
            buttonProps: {
              label: I18n.t("global.buttons.cancel"),
              accessibilityLabel: I18n.t("global.buttons.cancel"),
              onPress: () => {
                confirmModal.dismiss();
              }
            }
          }}
        />
      )
    },
    175
  );

  const body = (
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView>
        <ContentWrapper>
          <VSpacer size={16} />
          <H1>{I18n.t("idpay.unsubscription.title", { initiativeName })}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.unsubscription.subtitle")}</Body>
          <VSpacer size={16} />
          {unsubscriptionChecks.map((item, index) => (
            <UnsubscriptionCheckListItem
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              checked={checks.values[index]}
              onValueChange={value => checks.setValue(index, value)}
            />
          ))}
          <VSpacer size={48} />
        </ContentWrapper>
      </ScrollView>
      <LegacyFooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          bordered: true,
          title: I18n.t("global.buttons.cancel"),
          onPress: handleClosePress
        }}
        rightButton={{
          title: I18n.t("idpay.unsubscription.button.continue"),
          onPress: confirmModal.present,
          disabled: !checks.areFulfilled,
          danger: checks.areFulfilled
        }}
      />
    </SafeAreaView>
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("idpay.unsubscription.headerTitle")}
      customGoBack={closeButton}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {!isLoading && body}
      </LoadingSpinnerOverlay>
      {confirmModal.bottomSheet}
    </BaseScreenComponent>
  );
};

export default UnsubscriptionConfirmationScreen;
