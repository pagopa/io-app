import { IOVisualCostants, IconButton } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import I18n from "i18next";

const CloseButton = () => {
  const navigation = useNavigation();

  return (
    <View style={{ marginRight: IOVisualCostants.appMarginDefault }}>
      <IconButton
        icon="closeMedium"
        color="neutral"
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel={I18n.t("global.buttons.close")}
      />
    </View>
  );
};
export default CloseButton;
