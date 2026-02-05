import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { CredentialL3Key } from "../../common/utils/itwMocksUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwL3ScreensSection = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const navigation = useIONavigation();

  const handleCredentialPress = (credentialType: CredentialL3Key) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PLAYGROUNDS.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });
  };

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3) screens" />
      <ListItemNav
        value="Driving License L3"
        description="Navigate to the Driving License detail screen"
        onPress={() => handleCredentialPress("mdl")}
      />
      {isItwValid && (
        <ListItemNav
          value="EU Health Insurance Card L3"
          description="Navigate to the EHIC detail screen"
          onPress={() => handleCredentialPress("ts")}
        />
      )}
      <ListItemNav
        value="Disability Card L3"
        description="Navigate to the Disability Card detail screen"
        onPress={() => handleCredentialPress("dc")}
      />
      <ListItemNav
        value="Education Degree L3"
        description="Navigate to the Education Degree detail screen"
        onPress={() => handleCredentialPress("ed")}
      />
      <ListItemNav
        value="Education Enrollment L3"
        description="Navigate to the Education Enrollment detail screen"
        onPress={() => handleCredentialPress("ee")}
      />
      <ListItemNav
        value="Residency L3"
        description="Navigate to the Residency detail screen"
        onPress={() => handleCredentialPress("res")}
      />
      {/* <ListItemNav
        value="Education Diploma L3"
        description="Navigate to the Education Diploma detail screen"
        onPress={() => handleCredentialPress("edip")}
      />
      <ListItemNav
        value="Education Attestance L3"
        description="Navigate to the Education Attestance detail screen"
        onPress={() => handleCredentialPress("edat")}
      /> */}
    </View>
  );
};
