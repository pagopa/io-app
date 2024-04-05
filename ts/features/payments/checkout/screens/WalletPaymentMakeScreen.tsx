import React from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useIOSelector } from "../../../../store/hooks";
import { WalletPaymentHeader } from "../components/WalletPaymentHeader";
import { selectWalletPaymentCurrentStep } from "../store/selectors";
import { WalletPaymentConfirmScreen } from "./WalletPaymentConfirmScreen";
import { WalletPaymentPickMethodScreen } from "./WalletPaymentPickMethodScreen";
import { WalletPaymentPickPspScreen } from "./WalletPaymentPickPspScreen";

const WalletPaymentMakeScreen = () => {
  const ref = React.useRef<PagerView>(null);
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);

  React.useEffect(() => {
    ref.current?.setPage(currentStep - 1);
  }, [ref, currentStep]);

  return (
    <>
      <WalletPaymentHeader currentStep={currentStep} />
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        ref={ref}
        scrollEnabled={false}
      >
        <View key="1">
          <WalletPaymentPickMethodScreen />
        </View>
        <View key="2">
          <WalletPaymentPickPspScreen />
        </View>
        <View key="3">
          <WalletPaymentConfirmScreen />
        </View>
      </PagerView>
    </>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1
  }
});

export { WalletPaymentMakeScreen };
