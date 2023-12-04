import { pipe } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  Body,
  GradientScrollView,
  H2,
  ListItemHeader,
  ListItemRadioWithAmount,
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
  walletPaymentResetPickedPsp,
  walletPaymentSortPsp
} from "../store/actions/orchestration";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useSortPspBottomSheet } from "../hooks/useSortPspBottomSheet";
import { WalletPaymentPspSortType } from "../types";

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
    dispatch(walletPaymentSortPsp(sortType));
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
    (bundle: Bundle) => {
      dispatch(walletPaymentPickPsp(bundle));
    },
    [dispatch]
  );

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM
    });
  };

  const sortButtonProps: ListItemHeader["endElement"] = {
    type: "buttonLink",
    componentProps: {
      label: "Ordina",
      accessibilityLabel: "Ordina",
      onPress: () => {
        present();
      }
    }
  };

  const isPspSelected = (psp: Bundle) =>
    pipe(
      selectedPspOption,
      O.map(selectedPsp => selectedPsp.idBundle === psp.idBundle),
      O.getOrElse(() => false)
    );

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Continua",
        accessibilityLabel: "Continua",
        onPress: handleContinue,
        disabled: isLoading || !canContinue,
        loading: isLoading
      }}
    >
      <H2>Scegli chi gestierà il pagamento</H2>
      <VSpacer size={16} />
      <Body>Ogni gestore propone una commissione. </Body>
      <Body>
        In questa lista trovi tutti i gestori compatibili,{" "}
        <Body weight="SemiBold"> anche se non sei loro cliente.</Body>
      </Body>
      <VSpacer size={16} />
      <ListItemHeader
        label="Gestore"
        accessibilityLabel="Gestore"
        endElement={sortButtonProps}
      />
      {!isLoading &&
        pspList?.map(psp => (
          <ListItemRadioWithAmount
            key={psp.idPsp}
            label={psp.bundleName ?? "Nessun nome"}
            isSuggested={psp.onUs}
            selected={isPspSelected(psp)}
            onPress={_ => handlePspSelection(psp)}
            suggestReason="Perchè sei già cliente"
            formattedAmountString={formatNumberCentsToAmount(
              psp.taxPayerFee || 0,
              true
            )}
          />
        ))}
      {sortPspBottomSheet}
      {/* <DebugPrettyPrint title="pspListPot" data={pspListPot} /> */}
      {/* <DebugPrettyPrint title="selectedPspOption" data={selectedPspOption} /> */}
    </GradientScrollView>
  );
};

export { WalletPaymentPickPspScreen };
export type { WalletPaymentPickPspScreenNavigationParams };
