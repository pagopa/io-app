import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ContentWrapper } from "../../../components/core/ContentWrapper";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../components/core/variables/IOColors";
import I18n from "../../../i18n";

type Props = {
  onUploadBarcodePressed: () => void;
  onNavigateToCodeInputScreenPressed: () => void;
};

const BottomTabNavigation = (props: Props) => {
  const { onUploadBarcodePressed, onNavigateToCodeInputScreenPressed } = props;

  return (
    <SafeAreaView style={styles.navigationContainer}>
      <ContentWrapper>
        <View style={styles.navigationTabs}>
          <View style={[styles.tab, styles.tabActive]}>
            <LabelSmall color="grey-850" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.scan")}
            </LabelSmall>
          </View>
          <TouchableOpacity style={styles.tab} onPress={onUploadBarcodePressed}>
            <LabelSmall color="white" weight="Regular">
              {I18n.t("idpay.payment.qrCode.scan.tabs.upload")}
            </LabelSmall>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={onNavigateToCodeInputScreenPressed}
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
