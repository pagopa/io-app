import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { GradientScrollView } from "@pagopa/io-app-design-system";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentCalculateFees } from "../store/actions/networking";
import {
  walletPaymentChosenPspSelector,
  walletPaymentPspListSelector
} from "../store/selectors";
import { walletPaymentChoosePsp } from "../store/actions/orchestration";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";

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
  const isLoading = pot.isLoading(pspListPot);

  const selectedPspOption = useIOSelector(walletPaymentChosenPspSelector);

  const canContinue = O.isSome(selectedPspOption);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        walletPaymentCalculateFees.request({ walletId, paymentAmountInCents })
      );
    }, [dispatch, walletId, paymentAmountInCents])
  );

  const handlePspSelection = React.useCallback(
    (bundle: Bundle) => {
      dispatch(walletPaymentChoosePsp(bundle));
    },
    [dispatch]
  );

  // TODO just for testing purposes
  React.useEffect(() => {
    if (pot.isSome(pspListPot) && !canContinue) {
      const pspList = pspListPot.value;

      if (pspList.length > 0) {
        handlePspSelection(pspList[0]);
      }
    }
  }, [pspListPot, canContinue, handlePspSelection]);

  const handleContinue = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM
    });
  };

  return (
    <BaseScreenComponent goBack={true}>
      <GradientScrollView
        primaryActionProps={{
          label: "Continua",
          accessibilityLabel: "Continua",
          onPress: handleContinue,
          disabled: isLoading,
          loading: isLoading
        }}
      >
        <DebugPrettyPrint title="pspListPot" data={pspListPot} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentPickPspScreen };
export type { WalletPaymentPickPspScreenNavigationParams };
