import {
  Body,
  GradientScrollView,
  H2,
  ListItemHeader,
  RadioGroup,
  RadioItemWithAmount,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { getSortedPspList } from "../../common/utils";
import { WalletPspListSkeleton } from "../components/WalletPspListSkeleton";
import { useSortPspBottomSheet } from "../hooks/useSortPspBottomSheet";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCalculateFees } from "../store/actions/networking";
import {
  walletPaymentPickPsp,
  walletPaymentResetPickedPsp
} from "../store/actions/orchestration";
import {
  walletPaymentAmountSelector,
  walletPaymentPickedPaymentMethodSelector,
  walletPaymentPickedPspSelector,
  walletPaymentPspListSelector,
  walletPaymentTransactionTransferListSelector
} from "../store/selectors";
import { WalletPaymentPspSortType } from "../types";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

const WalletPaymentPickPspScreen = () => {
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const selectedWalletOption = useIOSelector(
    walletPaymentPickedPaymentMethodSelector
  );
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [showFeaturedPsp, setShowFeaturedPsp] = React.useState(true);
  const [sortType, setSortType] =
    React.useState<WalletPaymentPspSortType>("default");

  const transactionTransferListPot = useIOSelector(
    walletPaymentTransactionTransferListSelector
  );
  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  const isLoading = pot.isLoading(pspListPot);
  const isError = pot.isError(pspListPot);

  const canContinue = O.isSome(selectedPspOption);

  const sortedPspList = pipe(
    pot.toOption(pspListPot),
    O.map(_ => getSortedPspList(_, sortType)),
    O.toUndefined
  );

  React.useEffect(() => {
    if (isError) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.GENERIC_ERROR
        }
      });
    }
  }, [isError, navigation]);

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  useFocusEffect(
    React.useCallback(() => {
      pipe(
        sequenceT(O.Monad)(
          pot.toOption(paymentAmountPot),
          pot.toOption(transactionTransferListPot),
          selectedWalletOption
        ),
        O.map(([paymentAmountInCents, transferList, selectedWallet]) => {
          dispatch(
            walletPaymentCalculateFees.request({
              paymentMethodId: selectedWallet.paymentMethodId,
              walletId: selectedWallet.walletId,
              paymentAmount: paymentAmountInCents,
              transferList
            })
          );
        })
      );
    }, [
      dispatch,
      paymentAmountPot,
      selectedWalletOption,
      transactionTransferListPot
    ])
  );

  React.useEffect(
    () => () => {
      dispatch(walletPaymentResetPickedPsp());
    },
    [dispatch]
  );

  const handleChangePspSorting = (sortType: WalletPaymentPspSortType) => {
    setShowFeaturedPsp(sortType === "default");
    setSortType(sortType);
    dismiss();
  };

  const {
    bottomSheet: sortPspBottomSheet,
    present,
    dismiss
  } = useSortPspBottomSheet({
    onSortChange: handleChangePspSorting
  });

  const handlePspSelection = React.useCallback(
    (bundleId: string) => {
      if (!sortedPspList) {
        return;
      }
      const selectedBundle = sortedPspList.find(
        psp => psp.idBundle === bundleId
      );

      if (selectedBundle) {
        dispatch(walletPaymentPickPsp(selectedBundle));
      }
    },
    [dispatch, sortedPspList]
  );

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM
    });
  };

  const sortButtonProps: ListItemHeader["endElement"] = React.useMemo(
    () => ({
      type: "buttonLink",
      componentProps: {
        label: I18n.t("wallet.payment.psp.pspSortButton"),
        accessibilityLabel: I18n.t("wallet.payment.psp.pspSortButton"),
        onPress: present
      }
    }),
    [present]
  );

  const pspSelected = pipe(selectedPspOption, O.toUndefined);

  const SelectPspHeadingContent = React.useCallback(
    () => (
      <>
        <H2>{I18n.t("wallet.payment.psp.title")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("wallet.payment.psp.description")}</Body>
        <Body>
          {I18n.t("wallet.payment.psp.taxDescription")}{" "}
          <Body weight="SemiBold">
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
    <GradientScrollView
      primaryActionProps={
        canContinue
          ? {
              label: I18n.t("wallet.payment.psp.continueButton"),
              accessibilityLabel: I18n.t("wallet.payment.psp.continueButton"),
              onPress: handleContinue,
              disabled: isLoading,
              loading: isLoading
            }
          : undefined
      }
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
      {sortPspBottomSheet}
    </GradientScrollView>
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
        label: psp.bundleName ?? I18n.t("wallet.payment.psp.defaultName"),
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
