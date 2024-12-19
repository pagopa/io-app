import { IOColors, Icon, hexToRgba } from "@pagopa/io-app-design-system";
import { StyleSheet, Text, View } from "react-native";

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
    <Text
      style={{
        fontSize: 8,
        color: IOColors["grey-850"],
        marginLeft: 4,
        textTransform: "uppercase"
      }}
    >
      Test
    </Text>
  </View>
);

export default PagoPATestIndicator;
