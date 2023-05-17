import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { IORenderHtml } from "../../../../../components/core/IORenderHtml";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  getBPDMethodsSelector,
  paymentMethodsSelector
} from "../../../../../store/reducers/wallet/wallets";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateToOptInPaymentMethodsChoiceScreen } from "../../navigation/actions";
import {
  optInPaymentMethodsCompleted,
  optInPaymentMethodsFailure
} from "../../store/actions/optInPaymentMethods";

const styles = StyleSheet.create({
  headerContainer: {
    ...IOStyles.row,
    justifyContent: "space-between"
  }
});
const OptInPaymentMethodsCashbackUpdateScreen = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  const bpdPaymentMethods = useIOSelector(getBPDMethodsSelector);
  const paymentMethods = useIOSelector(paymentMethodsSelector);

  // This screen should be shown only if the payment method are correctly loaded
  if (paymentMethods.kind !== "PotSome") {
    dispatch(optInPaymentMethodsFailure("error in the payment method loading"));
  }

  const handleOnContinuePress = () => {
    if (bpdPaymentMethods.length > 0) {
      navigation.dispatch(navigateToOptInPaymentMethodsChoiceScreen());
    } else {
      dispatch(optInPaymentMethodsCompleted());
    }
  };

  return (
    // The void customGoBack is needed to have a centered header title
    <BaseScreenComponent
      showChat={false}
      goBack={false}
      headerTitle={I18n.t(
        "bonus.bpd.optInPaymentMethods.cashbackUpdate.header"
      )}
      customGoBack={
        <ButtonDefaultOpacity onPress={() => true} transparent={true} />
      }
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"OptInPaymentMethodsCashbackUpdate"}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <View style={styles.headerContainer}>
            <View style={IOStyles.flex}>
              <H1>
                {I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.title")}
              </H1>
            </View>
          </View>
          <VSpacer size={16} />
          <IORenderHtml
            source={{
              html: I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.body")
            }}
            renderersProps={{
              ul: {
                markerBoxStyle: {
                  paddingRight: 10
                }
              }
            }}
            tagsStyles={{
              li: {
                lineHeight: 20
              }
            }}
          />
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            handleOnContinuePress,
            I18n.t("global.buttons.choose"),
            undefined,
            "continueButton"
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OptInPaymentMethodsCashbackUpdateScreen;
