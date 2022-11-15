import { Text, View } from "native-base";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
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
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import customVariables from "../../../../theme/variables";
import BonusCardComponent from "../components/BonusCardComponent";

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    alignSelf: "center",
    width: widthPercentageToDP(90),
    maxWidth: 343,
    height: 192,
    top: 2
  }
});

// const

export const BonusDetailsScreen = () => {
  const bonus: InitiativeDTO = {
    nInstr: "0",
    endDate: new Date("2021-12-31"),
    initiativeId: "1",
    iban: "IT60X0542811101000000123456",
    status: StatusEnum.NOT_REFUNDABLE,
    accrued: 0,
    available: 500,
    refunded: 0,
    initiativeName: "18App"
  };

  return (
    <BaseScreenComponent
      dark={true}
      titleColor={"white"}
      goBack={true}
      headerTitle={"Bonus"}
      headerBackgroundColor={IOColors.bluegrey}
    >
      <FocusAwareStatusBar
        backgroundColor={IOColors.bluegrey}
        barStyle={"light-content"}
      />
      <ScrollView style={IOStyles.flex} bounces={false}>
        <LinearGradient colors={[IOColors.bluegrey, IOColors.bluegreyDark]}>
          <View style={[IOStyles.horizontalContentPadding, { height: 149 }]} />
        </LinearGradient>
        <View style={styles.card}>
          <BonusCardComponent {...bonus} />
        </View>

        <View
          style={[
            IOStyles.flex,
            IOStyles.horizontalContentPadding,
            { paddingTop: customVariables.contentPadding }
          ]}
        >
          <View spacer extralarge />
          <View spacer small />
          {bonus.nInstr === "0" && <Text>INIZIATIVA NON CONFIGURATA</Text>}
          
        </View>
      </ScrollView>
      {bonus.nInstr === "0" && (
        <>
          <FooterWithButtons
            type="SingleButton"
            leftButton={{ block: true, primary: true, title: "Inizia" }}
          />
          <View spacer />
        </>
      )}
    </BaseScreenComponent>
  );
};
