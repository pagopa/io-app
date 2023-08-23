import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  IOColors,
  Icon,
  hexToRgba,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";

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
  },
  testText: {
    letterSpacing: 0.2,
    marginLeft: 4,
    fontSize: 9,
    textTransform: "uppercase",
    color: IOColors["grey-850"],
    ...makeFontStyleObject("SemiBold")
  }
});

const PagoPATestIndicator = () => (
  <View style={styles.indicatoWrapper}>
    <Icon name="productPagoPA" color="grey-850" size={20} />
    <Text style={styles.testText}>Test</Text>
  </View>
);

export default PagoPATestIndicator;
