import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { IOBadge } from "../../../../../components/core/IOBadge";
import {
  RadioButtonList,
  RadioItem
} from "../../../../../components/core/selection/RadioButtonList";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { showToast } from "../../../../../utils/showToast";
import {
  confirmButtonProps,
  disablePrimaryButtonProps,
  errorBorderedButtonProps
} from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { useBottomSheetMethodsToDelete } from "../../components/optInStatus/BottomSheetMethodsToDelete";
import { isError, isReady, isUndefined } from "../../model/RemoteValue";
import {
  navigateToOptInPaymentMethodsThankYouDeleteMethodsScreen,
  navigateToOptInPaymentMethodsThankYouKeepMethodsScreen
} from "../../navigation/actions";
import { optInPaymentMethodsShowChoice } from "../../store/actions/optInPaymentMethods";
import { showOptInChoiceSelector } from "../../store/reducers/details/activation/ui";

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
        <IOBadge
          text={I18n.t("bonus.bpd.optInPaymentMethods.choice.suggestedOption")}
        />
        <VSpacer size={4} />
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

const disabledButtonProps = () =>
  disablePrimaryButtonProps(
    I18n.t("global.buttons.continue"),
    undefined,
    "disabledContinueButton"
  );

const OptInPaymentMethodsChoiceScreen = () => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodsChoiceOptions | null>(null);
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  const showOptInChoice = useIOSelector(showOptInChoiceSelector);

  const renderingRef = useRef(false);

  const { presentBottomSheet, bottomSheet } = useBottomSheetMethodsToDelete({
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

  const computedBottomButtonProps = useMemo(
    () =>
      selectedMethod === null
        ? disabledButtonProps()
        : bottomButtons[selectedMethod],
    [selectedMethod, bottomButtons]
  );

  useEffect(() => {
    if (isUndefined(showOptInChoice)) {
      dispatch(optInPaymentMethodsShowChoice.request());
    }
    if (
      isError(showOptInChoice) ||
      (isReady(showOptInChoice) && !showOptInChoice.value)
    ) {
      navigation.goBack();
      if (isError(showOptInChoice)) {
        showToast(I18n.t("global.genericError"));
      }
      if (!renderingRef.current) {
        showToast(
          I18n.t("bonus.bpd.optInPaymentMethods.choice.toast"),
          "warning"
        );
      }
    }

    // eslint-disable-next-line functional/immutable-data
    renderingRef.current = true;
  }, [dispatch, showOptInChoice, navigation]);

  return (
    <LoadingSpinnerOverlay
      isLoading={
        !isReady(showOptInChoice) ||
        (isReady(showOptInChoice) && !showOptInChoice.value)
      }
    >
      {/* The void customRightIcon and customGoBack are needed to have a centered header title */}
      <BaseScreenComponent
        showChat={false}
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
          <ScrollView style={IOStyles.horizontalContentPadding}>
            <H1>{I18n.t("bonus.bpd.optInPaymentMethods.choice.title")}</H1>
            <VSpacer size={8} />
            <Body color="bluegreyDark">
              {I18n.t("bonus.bpd.optInPaymentMethods.choice.subtitle")}
            </Body>
            <VSpacer size={16} />

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
        {bottomSheet}
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default OptInPaymentMethodsChoiceScreen;
