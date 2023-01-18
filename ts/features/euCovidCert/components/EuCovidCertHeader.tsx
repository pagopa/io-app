import * as React from "react";
import { View, Image, StyleSheet } from "react-native";
import { WithEUCovidCertificateHeaderData } from "../types/EUCovidCertificate";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import { isStringNullyOrEmpty } from "../../../utils/strings";

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
        <H1 testID={"EuCovidCertHeaderTitle"}>{props.headerData.title}</H1>
        <H2 testID={"EuCovidCertHeaderSubTitle"}>
          {props.headerData.subTitle}
        </H2>
      </View>
      {/* it could happen we don't want to show any logo, in that case url will be empty */}
      {!isStringNullyOrEmpty(props.headerData.logoUrl) && (
        <Image
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
