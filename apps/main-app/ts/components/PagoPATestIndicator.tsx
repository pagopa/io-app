import { Icon, IOColorPalette, withAlpha } from "@io-app/design-system";
import { StyleSheet, Text, View } from "react-native";

const debugItemBgColor = withAlpha(IOColorPalette.greyscale.white, 0.4);
const debugItemBorderColor = withAlpha(IOColorPalette.greyscale.black, 0.1);

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
    <Icon
      color={IOColorPalette.greyscale[850]}
      name="productPagoPA"
      size={20}
    />
    <Text
      style={{
        fontSize: 8,
        color: IOColorPalette.greyscale[850],
        marginLeft: 4,
        textTransform: "uppercase"
      }}
    >
      {/* eslint-disable-next-line i18next/no-literal-string -- test-environment badge label, not localized */}
      {"Test"}
    </Text>
  </View>
);

export default PagoPATestIndicator;
