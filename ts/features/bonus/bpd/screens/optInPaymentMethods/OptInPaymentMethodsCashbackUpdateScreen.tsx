import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { View } from "native-base";
import I18n from "../../../../../i18n";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";

const OptInPaymentMethodsCashbackUpdateScreen = () => (
  // The void customRightIcon and customGoBack are needed to have a centered header title
  <BaseScreenComponent
    showInstabugChat={false}
    goBack={false}
    headerTitle={I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.header")}
    customRightIcon={{
      iconName: "",
      onPress: () => true
    }}
    customGoBack={
      <ButtonDefaultOpacity onPress={() => true} transparent={true} />
    }
  >
    <SafeAreaView
      style={IOStyles.flex}
      testID={"OptInPaymentMethodsCashbackUpdate"}
    >
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>{I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.title")}</H1>
        <View spacer />
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

export default OptInPaymentMethodsCashbackUpdateScreen;
