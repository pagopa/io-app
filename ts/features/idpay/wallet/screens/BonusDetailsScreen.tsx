import { View } from "native-base";
import React from "react";
import { ImageBackground, ScrollView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../definitions/idpay/wallet/InitiativeDTO";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import cardBg from "../../../../../img/bonus/cgn/card_mask.png";
import BonusCardComponent from "../components/BonusCard";

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    alignSelf: "center",
    width: widthPercentageToDP(83),
    maxWidth: 340,
    height: 168,
    top: 2
    // backgroundColor: "red"
  }
  //   cardContainer: {
  //     height: "100%",
  //     width: widthPercentageToDP(90),
  //     maxWidth: 340
  //   },
  //   imageFull: {
  //     resizeMode: "stretch",
  //     height: 215,
  //     width: widthPercentageToDP(95),
  //     maxWidth: 360,
  //     top: -5,
  //     left: -10,
  //     zIndex: 8
  //   }
});

export const BonusDetailsScreen = (props: Props) => {
  const bonus: InitiativeDTO = {
    nInstr: "1",
    endDate: new Date("2021-12-31"),
    initiativeId: "1",
    iban: "IT60X0542811101000000123456",
    status: StatusEnum.REFUNDABLE,
    accrued: 0,
    available: 500,
    refunded: 0,
    initiativeName: "Circuito del Vino"
  };
  return (
    <BaseScreenComponent
      dark={true}
      titleColor={"white"}
      goBack={true}
      headerTitle={"Bonus"}
      headerBackgroundColor={IOColors.bluegrey}
    >
      <FocusAwareStatusBar backgroundColor={IOColors.black} />
      <ScrollView style={IOStyles.flex} bounces={false}>
        <LinearGradient colors={[IOColors.bluegrey, IOColors.bluegreyDark]}>
          <View style={[IOStyles.horizontalContentPadding, { height: 149 }]} />
        </LinearGradient>
        <View style={styles.card}>
          <BonusCardComponent {...bonus} />
        </View>
      </ScrollView>
    </BaseScreenComponent>
  );
};
