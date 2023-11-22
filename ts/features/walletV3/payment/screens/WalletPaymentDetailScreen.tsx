import {
  FooterWithButtons,
  IOVisualCostants,
  LoadingSpinner
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import React from "react";
import { SafeAreaView, View } from "react-native";
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
import { walletGetPaymentDetails } from "../store/actions";
import { walletPaymentDetailsSelector } from "../store/selectors";

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
  const isError = pot.isError(paymentDetailsPot);

  const navigateToMethodSelection = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_METHOD_LIST
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletGetPaymentDetails.request({ rptId }));
    }, [dispatch, rptId])
  );

  React.useEffect(() => {
    if (isError) {
      navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME
      });
    }
  }, [isError, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <LoadingSpinner size={48} />
      </SafeAreaView>
    );
  }

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            marginHorizontal: IOVisualCostants.appMarginDefault
          }}
        >
          <DebugPrettyPrint data={paymentDetailsPot} />
        </View>
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: "Vai al pagamento",
              onPress: navigateToMethodSelection,
              accessibilityLabel: "Vai al pagamento"
            }
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentDetailScreen };
export type { WalletPaymentDetailScreenNavigationParams };
