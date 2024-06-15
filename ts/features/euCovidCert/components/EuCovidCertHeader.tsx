import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { H3, H4 } from "@pagopa/io-app-design-system";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  column: { flexDirection: "column", flex: 1 },
  logo: {
    width: 84,
    height: 84
  }
});

/**
 * header with
 * | title       | logo |
 * | subtitle    |      |
 * @param props
 * @constructor
 */
export const EuCovidCertHeader = (props: WithEUCovidCertificateHeaderData) => (
  <>
    <View style={styles.row}>
      <View style={styles.column}>
        <H3 testID={"EuCovidCertHeaderTitle"}>{props.headerData.title}</H3>
        <H4 testID={"EuCovidCertHeaderSubTitle"}>
          {props.headerData.subTitle}
        </H4>
      </View>
      {/* it could happen we don't want to show any logo, in that case url will be empty */}
      {!isStringNullyOrEmpty(props.headerData.logoUrl) && (
        <Image
          accessibilityIgnoresInvertColors
          testID={"EuCovidCertHeaderLogoID"}
          source={{ uri: props.headerData.logoUrl }}
          style={styles.logo}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          resizeMode={"contain"}
        />
      )}
    </View>
  </>
);
