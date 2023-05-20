import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import { useConfirmationChecks } from "../../../../hooks/useConfirmationChecks";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { UnsubscriptionCheckListItem } from "../components/UnsubscriptionCheckListItem";
import { useUnsubscriptionMachineService } from "../xstate/provider";
import { isLoadingSelector, selectInitiativeName } from "../xstate/selectors";

const unsubscriptionChecks: ReadonlyArray<{ title: string; subtitle: string }> =
  [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content")
    }
  ];

const UnsubscriptionConfirmationScreen = () => {
  const machine = useUnsubscriptionMachineService();

  const isLoading = useSelector(machine, isLoadingSelector);
  const initiativeName = useSelector(machine, selectInitiativeName);

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
    <TouchableDefaultOpacity
      onPress={handleClosePress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-close"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

  const confirmModal = useIOBottomSheetModal(
    <Body>{I18n.t("idpay.unsubscription.modal.content")}</Body>,

    I18n.t("idpay.unsubscription.modal.title", { initiativeName }),
    250,

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
