import {
  IOColors,
  IOText,
  Icon,
  hexToRgba
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  indicatoWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: debugItemBgColor
  }
});

const PagoPATestIndicator = () => (
  <View style={styles.indicatoWrapper}>
    <Icon name="productPagoPA" color="grey-850" size={20} />
    <IOText
      weight="Semibold"
      color="grey-850"
      size={9}
      style={{ marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.2 }}
    >
      Test
    </IOText>
  </View>
);

export default PagoPATestIndicator;
