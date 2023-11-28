import { GradientScrollView } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentDetailsSelector } from "../store/selectors";
import { walletPaymentGetDetails } from "../store/actions/networking";

type WalletPaymentDetailScreenNavigationParams = {
  rptId: RptId;
};

type WalletPaymentDetailRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_DETAIL"
>;

const WalletPaymentDetailScreen = () => {
  const { params } = useRoute<WalletPaymentDetailRouteProps>();
  const { rptId } = params;
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const isLoading = pot.isLoading(paymentDetailsPot);

  const navigateToMethodSelection = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_METHOD
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetDetails.request(rptId));
    }, [dispatch, rptId])
  );

  return (
    <BaseScreenComponent goBack={true}>
      <GradientScrollView
        primaryActionProps={{
          label: "Vai al pagamento",
          accessibilityLabel: "Vai al pagmento",
          onPress: navigateToMethodSelection,
          disabled: isLoading,
          loading: isLoading
        }}
      >
        <DebugPrettyPrint title="paymentDetailsPot" data={paymentDetailsPot} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentDetailScreen };
export type { WalletPaymentDetailScreenNavigationParams };
