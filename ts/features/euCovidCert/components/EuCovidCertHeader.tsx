import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { View } from "native-base";
import { WithCertificateHeaderData } from "../types/EUCovidCertificate";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H2 } from "../../../components/core/typography/H2";
import { isStringNullyOrEmpty } from "../../../utils/strings";

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flexDirection: "column", flex: 1 },
  logo: {
    width: 84,
    height: 84
  }
});

/**
 * header with title/subtitle/image content as prop
 * @param props
 * @constructor
 */
export const EuCovidCertHeader = (props: WithCertificateHeaderData) => (
  <>
    <View style={styles.row}>
      <View style={styles.column}>
        <H1 style={IOStyles.flex}>{props.headerData.title}</H1>
        <H2>{props.headerData.subTitle}</H2>
      </View>
      {/* it could happen we don't want to show any logo, so the url will be empty */}
      {!isStringNullyOrEmpty(props.headerData.logoUrl) && (
        <Image
          source={{ uri: props.headerData.logoUrl }}
          style={styles.logo}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
        />
      )}
    </View>
  </>
);
