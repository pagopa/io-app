import { View } from "native-base";
import * as React from "react";

import { Platform, StyleSheet } from "react-native";
import Heart from "../../../../img/features/uaDonations/heart.svg";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";

const styles = StyleSheet.create({
  background: {
    backgroundColor: IOColors.blue,
    marginTop: 24,
    // on iOS we can fit the original design a little better
    marginHorizontal: Platform.OS === "ios" ? -8 : 0,
    padding: 16,
    borderRadius: 16
  },
  row: { flexDirection: "row", alignItems: "center" },
  text: {
    flex: 1,
    paddingRight: 16
  }
});

/**
 * Render a banner using a remote text and a heart icon.
 * Tap on this banner generate a navigation to the donation screen.
 * This component is visible only if:
 * local feature flag === true && remote feature flag === true && remote banner visible === true
 * @constructor
 */
export const UaDonationBanner = (): React.ReactElement => (
  <View style={styles.background}>
    <View style={styles.row}>
      <H5 color={"white"} weight={"Regular"} style={styles.text}>
        Con IO puoi fare una donazione alle organizzazioni umanitarie che
        assistono le vittime del conflitto in Ucraina
      </H5>
      <Heart
        width={50}
        height={50}
        fill={IOColors.white}
        style={IOStyles.flex}
      />
    </View>
  </View>
);
