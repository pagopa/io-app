import { SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ThankYouComponent from "../../components/optInPaymentMethods/ThankYouComponent";

const OptInPaymentMethodsThankYouDeleteMethodsScreen = () => {
  useEffect(() => {
    // dispatch saga that delete payment methods and update opt-in field
  });

  // if the payment methods deletion fails show the retry component

  // both the payment methods deletion and the opt-in update succeed, show the thank you page
  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={"OptInPaymentMethodsThankYouDeleteMethodsScreen"}
    >
      <ThankYouComponent />
    </SafeAreaView>
  );
};

export default OptInPaymentMethodsThankYouDeleteMethodsScreen;
