import { Divider, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

export const DSNativeBottomSheet = () => {
  const navigation = useIONavigation();

  return (
    <DesignSystemScreen title={DESIGN_SYSTEM_ROUTES.NATIVE.BOTTOM_SHEET.title}>
      <View>
        {Object.values(DESIGN_SYSTEM_ROUTES.NATIVE_SHEETS).map(
          (item, index, arr) => (
            <View key={item.route}>
              <ListItemNav
                value={item.title}
                accessibilityLabel={item.title}
                onPress={() => navigation.navigate(item.route as any)}
              />
              {index < arr.length - 1 && <Divider />}
            </View>
          )
        )}
      </View>
    </DesignSystemScreen>
  );
};
