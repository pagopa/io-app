import { GradientScrollView } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { DebugPrettyPrint } from "../../../../components/DebugPrettyPrint";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentCreateTransaction } from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";

const WalletPaymentReviewScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const transactionPot = useIOSelector(walletPaymentTransactionSelector);

  const isLoading = pot.isLoading(transactionPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentCreateTransaction.request({ paymentNotices: [] }));
    }, [dispatch])
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleContinue = () => {};

  return (
    <BaseScreenComponent goBack={true}>
      <GradientScrollView
        primaryActionProps={{
          label: "Paga xx,xx €",
          accessibilityLabel: "Paga xx,xx €",
          onPress: handleContinue,
          disabled: isLoading,
          loading: isLoading
        }}
      >
        <DebugPrettyPrint title="transactionPot" data={transactionPot} />
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentReviewScreen };
