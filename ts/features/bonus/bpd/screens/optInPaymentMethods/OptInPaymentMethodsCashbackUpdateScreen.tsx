import React from "react";
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { View } from "native-base";
import I18n from "../../../../../i18n";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { IORenderHtml } from "../../../../../components/core/IORenderHtml";
import { H2 } from "../../../../../components/core/typography/H2";
import { Body } from "../../../../../components/core/typography/Body";
import { useIOSelector } from "../../../../../store/hooks";
import { availableBonusTypesSelectorFromId } from "../../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_BPD_TYPE } from "../../../bonusVacanze/utils/bonus";
import dafaultLogo from "../../../../../../img/bonus/bpd/logo_cashback_blue.png";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
    width: 48,
    height: 46
  },
  headerContainer: {
    ...IOStyles.row,
    justifyContent: "space-between"
  }
});
const OptInPaymentMethodsCashbackUpdateScreen = () => {
  const bpdInfo = useIOSelector(availableBonusTypesSelectorFromId(ID_BPD_TYPE));
  const bpdLogo: ImageSourcePropType = bpdInfo?.cover
    ? { uri: bpdInfo?.cover }
    : dafaultLogo;

  return (
    // The void customRightIcon and customGoBack are needed to have a centered header title
    <BaseScreenComponent
      showInstabugChat={false}
      goBack={false}
      headerTitle={I18n.t(
        "bonus.bpd.optInPaymentMethods.cashbackUpdate.header"
      )}
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
          <View style={styles.headerContainer}>
            <View>
              <H2>
                {I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.title")}
              </H2>
              <Body>
                {I18n.t(
                  "bonus.bpd.optInPaymentMethods.cashbackUpdate.subtitle"
                )}
              </Body>
            </View>
            <Image source={bpdLogo} style={styles.logo} />
          </View>
          <View spacer />
          <IORenderHtml
            source={{
              html: I18n.t("bonus.bpd.optInPaymentMethods.cashbackUpdate.body")
            }}
          />
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            () => true,
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default OptInPaymentMethodsCashbackUpdateScreen;
