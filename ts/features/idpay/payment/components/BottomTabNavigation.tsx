import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayPaymentRoutes } from "../navigation/navigator";

const BottomTabNavigation = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const navigateToCodeInputScreen = () =>
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT
    });

  const showUploadModal = () => {
    // TODO QRCode upload will be handled in another PR
    alert("TODO 😄");
  };

  return (
    <SafeAreaView style={styles.navigationContainer}>
      <ContentWrapper>
        <View style={styles.navigationTabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <LabelSmall color="grey-850" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.scan")}
            </LabelSmall>
          </View>
          <TouchableOpacity style={styles.tab} onPress={showUploadModal}>
            <LabelSmall color="white" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.upload")}
            </LabelSmall>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={navigateToCodeInputScreen}
          >
            <LabelSmall color="white" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.input")}
            </LabelSmall>
          </TouchableOpacity>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    backgroundColor: IOColors["blueIO-850"],
    margin: 8
  },
  navigationTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24
  },
  tab: {
    width: 100,
    alignItems: "center",
    paddingVertical: 8
  },
  tabActive: {
    backgroundColor: IOColors.white,
    borderRadius: 85
  }
});

export { BottomTabNavigation };
