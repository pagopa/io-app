import {
  Body,
  H2,
  ListItemHeader,
  RadioGroup,
  RadioItemWithAmount,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect, useMemo, useState } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import I18n from "i18next";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { getSortedPspList } from "../../common/utils";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { WalletPspListSkeleton } from "../components/WalletPspListSkeleton";
import { useSortPspBottomSheet } from "../hooks/useSortPspBottomSheet";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  selectPaymentPspAction,
  walletPaymentSetCurrentStep
} from "../store/actions/orchestration";
import { selectWalletPaymentCurrentStep } from "../store/selectors";
import {
  walletPaymentPspListSelector,
  walletPaymentSelectedPspSelector
} from "../store/selectors/psps";
import { WalletPaymentPspSortType, WalletPaymentStepEnum } from "../types";
import { FaultCodeCategoryEnum } from "../types/PspPaymentMethodNotAvailableProblemJson";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { WalletPaymentPspBanner } from "../components/WalletPaymentPspBanner";

const WalletPaymentPickPspScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);

  const [showFeaturedPsp, setShowFeaturedPsp] = useState(true);

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const selectedPspOption = useIOSelector(walletPaymentSelectedPspSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const isLoading = pot.isLoading(pspListPot);
  const isError = pot.isError(pspListPot);

  const canContinue = O.isSome(selectedPspOption);

  const handleChangePspSorting = (sortType: WalletPaymentPspSortType) => {
    setShowFeaturedPsp(sortType === "default");
    dismiss();
  };

  const {
    sortType,
    bottomSheet: sortPspBottomSheet,
    present,
    dismiss
  } = useSortPspBottomSheet({
    onSortChange: handleChangePspSorting
  });

  const sortedPspList = pipe(
    pot.toOption(pspListPot),
    O.map(_ => getSortedPspList(_, sortType)),
    O.toUndefined
  );

  useEffect(() => {
    if (
      isError &&
      (pspListPot.error as WalletPaymentFailure)?.faultCodeCategory ===
        FaultCodeCategoryEnum.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR
    ) {
      navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_FAILURE,
        params: {
          error: pspListPot.error
        }
      });
    }
  }, [isError, navigation, pspListPot]);

  useFocusEffect(
    useCallback(() => {
      if (
        !pot.isSome(pspListPot) ||
        pot.isLoading(pspListPot) ||
        currentStep !== WalletPaymentStepEnum.PICK_PSP
      ) {
        return;
      }
      const preSelectedPsp = O.toUndefined(selectedPspOption);
      analytics.trackPaymentFeeSelection({
        attempt: paymentAnalyticsData?.attempt,
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        amount: paymentAnalyticsData?.formattedAmount,
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
        payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
        preselected_psp_flag: preSelectedPsp ? "customer" : "none",
        saved_payment_method:
          paymentAnalyticsData?.savedPaymentMethods?.length || 0
      });
      // only need to run when the pspList changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pspListPot])
  );

  const handlePspSelection = useCallback(
    (bundleId: string) => {
      if (!sortedPspList) {
        return;
      }
      const selectedBundle = sortedPspList.find(
        psp => psp.idBundle === bundleId
      );

      if (selectedBundle) {
        dispatch(selectPaymentPspAction(selectedBundle));
      }
    },
    [dispatch, sortedPspList]
  );

  const handleContinue = () => {
    analytics.trackPaymentFeeSelected({
      attempt: paymentAnalyticsData?.attempt,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      amount: paymentAnalyticsData?.formattedAmount,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      saved_payment_method:
        paymentAnalyticsData?.savedPaymentMethods?.length || 0,
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
      selected_psp_flag: paymentAnalyticsData?.selectedPspFlag
    });
    dispatch(
      walletPaymentSetCurrentStep(WalletPaymentStepEnum.CONFIRM_TRANSACTION)
    );
  };

  const sortButtonProps: ListItemHeader["endElement"] = useMemo(
    () => ({
      type: "buttonLink",
      componentProps: {
        testID: "wallet-payment-pick-psp-sort-button",
        label: I18n.t("wallet.payment.psp.pspSortButton"),
        accessibilityLabel: I18n.t("wallet.payment.psp.pspSortButton"),
        onPress: present
      }
    }),
    [present]
  );

  const pspSelected = pipe(selectedPspOption, O.toUndefined);

  const SelectPspHeadingContent = useCallback(
    () => (
      <>
        <H2>{I18n.t("wallet.payment.psp.title")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("wallet.payment.psp.description")}</Body>
        <Body>
          {I18n.t("wallet.payment.psp.taxDescription")}{" "}
          <Body weight="Semibold">
            {I18n.t("wallet.payment.psp.taxDescriptionBold")}
          </Body>
        </Body>
        <VSpacer size={16} />
        <ListItemHeader
          label={I18n.t("wallet.payment.psp.pspTitle")}
          accessibilityLabel={I18n.t("wallet.payment.psp.pspTitle")}
          endElement={sortButtonProps}
        />
      </>
    ),
    [sortButtonProps]
  );

  return (
    <IOScrollView
      actions={
        canContinue
          ? {
              type: "SingleButton",
              primary: {
                label: I18n.t("wallet.payment.psp.continueButton"),
                accessibilityLabel: I18n.t("wallet.payment.psp.continueButton"),
                onPress: handleContinue,
                disabled: isLoading,
                loading: isLoading
              }
            }
          : undefined
      }
    >
      <WalletPaymentPspBanner />
      <Animated.View
        style={{ flex: 1 }}
        layout={LinearTransition.duration(200)}
      >
        <SelectPspHeadingContent />
        {!isLoading && (
          <RadioGroup<string>
            onPress={handlePspSelection}
            type="radioListItemWithAmount"
            selectedItem={pspSelected?.idBundle}
            items={getRadioItemsFromPspList(sortedPspList, showFeaturedPsp)}
          />
        )}
        {isLoading && <WalletPspListSkeleton />}
      </Animated.View>
      {sortPspBottomSheet}
    </IOScrollView>
  );
};

const getRadioItemsFromPspList = (
  pspList?: Array<Bundle>,
  showFeaturedPsp?: boolean
) =>
  pipe(
    pspList,
    O.fromNullable,
    O.map(list =>
      list.map((psp, index) => ({
        id: psp.idBundle ?? index.toString(),
        label: psp.pspBusinessName ?? I18n.t("wallet.payment.psp.defaultName"),
        isSuggested: psp.onUs && showFeaturedPsp,
        suggestReason: I18n.t("wallet.payment.psp.featuredReason"),
        formattedAmountString: formatNumberCentsToAmount(
          psp.taxPayerFee ?? 0,
          true,
          "right"
        )
      }))
    ),
    O.getOrElse(() => [] as ReadonlyArray<RadioItemWithAmount<string>>)
  );

export { WalletPaymentPickPspScreen };
