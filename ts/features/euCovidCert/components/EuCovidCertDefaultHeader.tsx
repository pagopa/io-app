import * as React from "react";
import { View } from "native-base";
import { Image, StyleSheet } from "react-native";
import { H1 } from "../../../components/core/typography/H1";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H2 } from "../../../components/core/typography/H2";
import I18n from "../../../i18n";
import image from "../../../../img/features/euCovidCert/eu-flag.png";

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flexDirection: "column", flex: 1 },
  euFlag: {
    width: 84,
    height: 84
  }
});

/**
 * header with fixed title/subtitle/image
 * @constructor
 */
export const EuCovidCertDefaultHeader = () => (
  <>
    <View style={styles.row}>
      <H1 style={IOStyles.flex}>
        {I18n.t("features.euCovidCertificate.common.title")}
      </H1>
      <Image
        source={image}
        style={styles.euFlag}
        importantForAccessibility={"no"}
        accessibilityElementsHidden={true}
      />
    </View>
    <H2>{I18n.t("features.euCovidCertificate.common.subtitle")}</H2>
  </>
);
