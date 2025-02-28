import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_REMOTE_ROUTES } from "../../presentation/remote/navigation/routes";

export const ItwRemotePresentationSection = () => {
  const navigation = useIONavigation();

  return (
    <View>
      <ListItemHeader label="Remote Presentation" />
      <ListItemNav
        value="Trust Screen"
        description="Navigate to the Relying Party Trust screen"
        onPress={() =>
          navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
            screen: ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE
          })
        }
      />
    </View>
  );
};
