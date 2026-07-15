import { IconButton, IOVisualCostants } from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { View } from "react-native";

const CloseButton = () => {
  const navigation = useNavigation();

  return (
    <View style={{ marginRight: IOVisualCostants.appMarginDefault }}>
      <IconButton
        accessibilityLabel={I18n.t("global.buttons.close")}
        color="neutral"
        icon="closeMedium"
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
};
export default CloseButton;
