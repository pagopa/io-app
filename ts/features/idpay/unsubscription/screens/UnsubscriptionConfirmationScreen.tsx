import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconButton from "../../../../components/ui/IconButton";
import { useConfirmationChecks } from "../../../../hooks/useConfirmationChecks";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { UnsubscriptionCheckListItem } from "../components/UnsubscriptionCheckListItem";
import { useUnsubscriptionMachineService } from "../xstate/provider";
import {
  isLoadingSelector,
  selectInitiativeName,
  selectUnsubscriptionChecks
} from "../xstate/selectors";

const UnsubscriptionConfirmationScreen = () => {
  const machine = useUnsubscriptionMachineService();
  const isLoading = useSelector(machine, isLoadingSelector);
  const initiativeName = useSelector(machine, selectInitiativeName);
  const unsubscriptionChecks = useSelector(machine, selectUnsubscriptionChecks);

  const checks = useConfirmationChecks(unsubscriptionChecks.length);

  const handleClosePress = () =>
    machine.send({
      type: "EXIT"
    });

  const handleConfirmPress = () => {
    machine.send({
      type: "CONFIRM_UNSUBSCRIPTION"
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
          leftButton={{
            onPress: () => {
              confirmModal.dismiss();
              handleConfirmPress();
            },
            block: true,
            bordered: true,
            title: I18n.t("idpay.unsubscription.button.continue"),
            danger: true,
            labelColor: IOColors.red
          }}
          rightButton={{
            onPress: () => {
              confirmModal.dismiss();
            },
            block: true,
            bordered: true,
            title: I18n.t("global.buttons.cancel"),
            labelColor: IOColors.blue
          }}
        />
      )
    },
    150
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
      <FooterWithButtons
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
