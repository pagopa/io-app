import { useRef, useEffect, useLayoutEffect } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { WalletPaymentHeader } from "../components/WalletPaymentHeader";
import { selectWalletPaymentCurrentStep } from "../store/selectors";
import { WalletPaymentConfirmScreen } from "./WalletPaymentConfirmScreen";
import { WalletPaymentPickMethodScreen } from "./WalletPaymentPickMethodScreen";
import { WalletPaymentPickPspScreen } from "./WalletPaymentPickPspScreen";

const WalletPaymentMakeScreen = () => {
  const navigation = useIONavigation();
  const ref = useRef<PagerView>(null);
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);

  useEffect(() => {
    ref.current?.setPage(currentStep - 1);
  }, [ref, currentStep]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <WalletPaymentHeader currentStep={currentStep} />,
      headerShown: true
    });
  }, [navigation, currentStep]);

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      ref={ref}
      scrollEnabled={false}
    >
      <View key="1" style={{ flex: 1 }}>
        <WalletPaymentPickMethodScreen />
      </View>
      <View key="2" style={{ flex: 1 }}>
        <WalletPaymentPickPspScreen />
      </View>
      <View key="3" style={{ flex: 1 }}>
        <WalletPaymentConfirmScreen />
      </View>
      {/* This View is used by a11y purposes on Android in order to make the screen reader, read the correct total pages number. */}
      <View key="4">
        <View />
      </View>
    </PagerView>
  );
};

export { WalletPaymentMakeScreen };
