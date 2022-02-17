import React, { useState } from "react";
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
  errorButtonProps,
  disablePrimaryButtonProps
} from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { H4 } from "../../../../../components/core/typography/H4";
import { Body } from "../../../../../components/core/typography/Body";
import { PrimaryBadge } from "../../../../../components/core/Badge";

type PaymentMethodsChoiceOptions =
  | "keepPaymentMethods"
  | "deletePaymentMethods";

const generateOptionBody = (
  title: string,
  body: string,
  showBadge?: boolean
) => (
  <>
    {showBadge ? (
      <>
        <PrimaryBadge>
          {I18n.t("bonus.bpd.optInPaymentMethods.choice.suggestedOption")}
        </PrimaryBadge>
        <View spacer xsmall />
      </>
    ) : undefined}
    <H4>{title}</H4>
    <Body color="bluegrey">{body}</Body>
  </>
);

const radioButtonListItems: ReadonlyArray<
  RadioItem<PaymentMethodsChoiceOptions>
> = [
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

const OptInPaymentMethodsChoiceScreen = () => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodsChoiceOptions | null>(null);

  const bottomButtons: {
    [key in PaymentMethodsChoiceOptions]: BlockButtonProps;
  } = {
    keepPaymentMethods: confirmButtonProps(
      () => null,
      I18n.t("global.buttons.continue"),
      undefined,
      "continueButton"
    ),

    deletePaymentMethods: errorButtonProps(
      () => null,
      I18n.t("bonus.bpd.optInPaymentMethods.choice.deleteAllButton"),
      undefined
    )
  };

  const computedBottomButtonProps =
    selectedMethod === null
      ? disablePrimaryButtonProps(I18n.t("global.buttons.continue"))
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
            items={radioButtonListItems}
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
