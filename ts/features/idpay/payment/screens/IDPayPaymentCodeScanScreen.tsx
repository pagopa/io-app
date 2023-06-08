import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import CameraScanOverlaySVG from "../../../../../img/camera-scan-overlay.svg";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { BaseHeader } from "../../../../components/screens/BaseHeader";
import IconButton from "../../../../components/ui/IconButton";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const IDPayPaymentCodeScanScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const customGoBack = (
    <IconButton
      icon="close"
      onPress={() => {
        navigation.goBack();
      }}
      accessibilityLabel="ciao"
      color="contrast"
    />
  );

  const headerContent = (
    <BaseHeader customGoBack={customGoBack} backgroundColor={"transparent"} />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.cameraContainer}></View>
      <SafeAreaView style={styles.navigation}>
        <ContentWrapper>
          <View style={styles.navigationTabs}>
            <View style={[styles.tab, styles.tabActive]}>
              <LabelSmall color="grey-850" weight="Regular">
                Inquadra
              </LabelSmall>
            </View>
            <View style={styles.tab}>
              <LabelSmall color="white" weight="Regular">
                Carica
              </LabelSmall>
            </View>
            <View style={styles.tab}>
              <LabelSmall color="white" weight="Regular">
                Digita
              </LabelSmall>
            </View>
          </View>
        </ContentWrapper>
      </SafeAreaView>
      <View style={styles.header}>
        <LinearGradient
          colors={["#03134480", "#03134400"]}
          style={IOStyles.flex}
        >
          {headerContent}
        </LinearGradient>
      </View>
      <View style={styles.overlay}>
        <CameraScanOverlaySVG width={230} height={230} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: IOColors["blueIO-850"]
  },
  header: {
    position: "absolute",
    width: "100%",
    height: 160
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "95%",
    alignItems: "center",
    justifyContent: "center"
  },
  cameraContainer: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: IOColors["blueIO-50"],
    borderRadius: 24
  },
  navigation: {
    backgroundColor: IOColors["blueIO-850"],
    margin: 8
  },
  navigationTabs: {
    paddingVertical: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
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

export { IDPayPaymentCodeScanScreen };
