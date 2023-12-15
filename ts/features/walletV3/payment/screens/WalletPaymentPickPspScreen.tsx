import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  Body,
  GradientScrollView,
  H2,
  ListItemHeader,
  RadioGroup,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCalculateFees } from "../store/actions/networking";
import {
  walletPaymentPickedPspSelector,
  walletPaymentPspListSelector
} from "../store/selectors";
import {
  walletPaymentPickPsp,
  walletPaymentResetPickedPsp
} from "../store/actions/orchestration";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useSortPspBottomSheet } from "../hooks/useSortPspBottomSheet";
import { WalletPaymentPspSortType } from "../types";
import I18n from "../../../../i18n";
import { WalletPspListSkeleton } from "../components/WalletPspListSkeleton";
import { getSortedPspList } from "../../common/utils";

type WalletPaymentPickPspScreenNavigationParams = {
  walletId: string;
  paymentAmountInCents: number;
};

type WalletPaymentPickPspRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_PICK_PSP"
>;

const WalletPaymentPickPspScreen = () => {
  const { params } = useRoute<WalletPaymentPickPspRouteProps>();
  const { paymentAmountInCents, walletId } = params;
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [showFeaturedPsp, setShowFeaturedPsp] = React.useState(true);
  const [sortType, setSortType] =
    React.useState<WalletPaymentPspSortType>("default");

  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const pspList = pot.toUndefined(pspListPot);
  const isLoading = pot.isLoading(pspListPot);

  const selectedPspOption = useIOSelector(walletPaymentPickedPspSelector);

  const canContinue = O.isSome(selectedPspOption);

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    faqCategories: ["payment"],
    supportRequest: true
  });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        walletPaymentCalculateFees.request({ walletId, paymentAmountInCents })
      );
    }, [dispatch, walletId, paymentAmountInCents])
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

  const sortedPspList = pipe(
    pot.toOption(pspListPot),
    O.map(_ => getSortedPspList(_, sortType)),
    O.toUndefined
  );

  const handlePspSelection = React.useCallback(
    (bundleId: string) => {
      if (!pspList) {
        return;
      }
      const selectedBundle = pspList.find(psp => psp.idBundle === bundleId);
      if (selectedBundle) {
        dispatch(walletPaymentPickPsp(selectedBundle));
      }
    },
    [dispatch, pspList]
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
      primaryActionProps={{
        label: I18n.t("wallet.payment.psp.continueButton"),
        accessibilityLabel: I18n.t("wallet.payment.psp.continueButton"),
        onPress: handleContinue,
        disabled: isLoading || !canContinue,
        loading: isLoading
      }}
    >
      <SelectPspHeadingContent />
      {/* <RadioGroup<string>
        onPress={handlePspSelection}
        type="radioListItemWithAmount"
        selectedItem={pspSelected?.idBundle}
        items={getRadioItemsFromPspList(sortedPspList, showFeaturedPsp)}
      /> */}
      {isLoading && <WalletPspListSkeleton />}
      {sortPspBottomSheet}
    </GradientScrollView>
  );
};

const getRadioItemsFromPspList = (
  pspList?: Array<Bundle>,
  showFeaturedPsp?: boolean
) =>
  !pspList
    ? []
    : pspList?.map((psp, index) => ({
        id: psp.idBundle ?? index.toString(),
        label: psp.bundleName ?? I18n.t("wallet.payment.psp.defaultName"),
        isSuggested: psp.onUs && showFeaturedPsp,
        suggestReason: I18n.t("wallet.payment.psp.featuredReason"),
        formattedAmountString: formatNumberCentsToAmount(
          psp.taxPayerFee || 0,
          true,
          "right"
        )
      }));

export { WalletPaymentPickPspScreen };
export type { WalletPaymentPickPspScreenNavigationParams };
