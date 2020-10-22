import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import customVariables from "../theme/variables";
import { InfoBox } from "./box/InfoBox";
import { H4 } from "./core/typography/H4";

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    bottom: 102,
    zIndex: 1000,
    backgroundColor: "#00C5CA",
    width: widthPercentageToDP(100)
  }
});

const RemovedAccountInfoOverlay: React.FunctionComponent = () => (
  <View style={styles.versionContainer} pointerEvents="box-none">
    <InfoBox iconColor={customVariables.brandDarkestGray}>
      {/* <View style={{ paddingVertical: 15, paddingRight: 24 }}> */}
      <H4>
        {`Attenzione! Stiamo procedendo con la tua richiesta di eliminazione del profilo. Se si desidera annullare la richiesta, vai in Profilo {">"} Privacy e Condizioni d\`&apos;\`uso {">"} Elimina il tuo account.`}
      </H4>
      {/* </View> */}
    </InfoBox>
  </View>
);

export default RemovedAccountInfoOverlay;
