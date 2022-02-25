import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import I18n from "../../../../../i18n";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  confirmButtonProps,
  disablePrimaryButtonProps,
  errorBorderedButtonProps
} from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { H4 } from "../../../../../components/core/typography/H4";
import { Body } from "../../../../../components/core/typography/Body";
import { IOPrimaryBadge } from "../../../../../components/core/IOBadge";
import { useBottomSheetMethodsToDelete } from "../../components/optInStatus/BottomSheetMethodsToDelete";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import {
  navigateToOptInPaymentMethodsThankYouDeleteMethodsScreen,
  navigateToOptInPaymentMethodsThankYouKeepMethodsScreen
} from "../../navigation/actions";

type PaymentMethodsChoiceOptions =
  | "keepPaymentMethods"
  | "deletePaymentMethods";

const generateOptionBody = (
  title: string,
  body: string,
  showBadge?: boolean
) => (
  <>
    {showBadge && (
      <>
        <IOPrimaryBadge
          text={I18n.t("bonus.bpd.optInPaymentMethods.choice.suggestedOption")}
        />
        <View spacer xsmall />
      </>
    )}
    <H4>{title}</H4>
    <LabelSmall weight="Regular" color="bluegrey">
      {body}
    </LabelSmall>
  </>
);

const radioButtonListItems: () => ReadonlyArray<
  RadioItem<PaymentMethodsChoiceOptions>
> = () => [
  {
    id: "keepPaymentMethods",
    body: generateOptionBody(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.keepAll.title"),
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.keepAll.body"),
      true
    )
  },
  {
    id: "deletePaymentMethods",
    body: generateOptionBody(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.deleteAll.title"),
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.deleteAll.body")
    )
  }
];

const disabledButtonProps = disablePrimaryButtonProps(
  I18n.t("global.buttons.continue"),
  undefined,
  "disabledContinueButton"
);

const OptInPaymentMethodsChoiceScreen = () => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodsChoiceOptions | null>(null);
  const navigation = useNavigation();

  const { presentBottomSheet } = useBottomSheetMethodsToDelete({
    onDeletePress: () =>
      navigation.dispatch(
        navigateToOptInPaymentMethodsThankYouDeleteMethodsScreen()
      )
  });

  const bottomButtons: {
    [key in PaymentMethodsChoiceOptions]: BlockButtonProps;
  } = useMemo(
    () => ({
      keepPaymentMethods: confirmButtonProps(
        () =>
          navigation.dispatch(
            navigateToOptInPaymentMethodsThankYouKeepMethodsScreen()
          ),
        I18n.t("global.buttons.continue"),
        undefined,
        "continueButton"
      ),

      deletePaymentMethods: errorBorderedButtonProps(
        presentBottomSheet,
        I18n.t("bonus.bpd.optInPaymentMethods.choice.deleteAllButton"),
        undefined
      )
    }),
    [navigation, presentBottomSheet]
  );

  const computedBottomButtonProps =
    selectedMethod === null
      ? disabledButtonProps
      : bottomButtons[selectedMethod];

  return (
    // The void customRightIcon and customGoBack are needed to have a centered header title
    <BaseScreenComponent
      showInstabugChat={false}
      goBack={false}
      headerTitle={I18n.t("bonus.bpd.optInPaymentMethods.choice.header")}
      customRightIcon={{
        iconName: "",
        onPress: () => true
      }}
      customGoBack={
        <ButtonDefaultOpacity onPress={() => true} transparent={true} />
      }
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"OptInPaymentMethodsCashbackUpdate"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.bpd.optInPaymentMethods.choice.title")}</H1>
          <View spacer small />
          <Body color="bluegreyDark">
            {I18n.t("bonus.bpd.optInPaymentMethods.choice.subtitle")}
          </Body>
          <View spacer />

          <RadioButtonList<PaymentMethodsChoiceOptions>
            items={radioButtonListItems()}
            selectedItem={selectedMethod || undefined}
            onPress={setSelectedMethod}
            rightSideSelection
          />
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={computedBottomButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OptInPaymentMethodsChoiceScreen;
