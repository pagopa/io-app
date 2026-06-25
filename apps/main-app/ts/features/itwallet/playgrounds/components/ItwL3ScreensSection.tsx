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
        description="Navigate to the PID detail screen"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
          })
        }
        value="IT-Wallet ID (PID)"
      />
      <ListItemNav
        description="Navigate to the Driving License detail screen"
        onPress={() => handleCredentialPress("mdl")}
        value="Driving License L3"
      />
      {isItwValid && (
        <ListItemNav
          description="Navigate to the EHIC detail screen"
          onPress={() => handleCredentialPress("ts")}
          value="EU Health Insurance Card L3"
        />
      )}
      <ListItemNav
        description="Navigate to the Disability Card detail screen"
        onPress={() => handleCredentialPress("dc")}
        value="Disability Card L3"
      />
      <ListItemNav
        description="Navigate to the Age Verification detail screen"
        onPress={() => handleCredentialPress("age_verification")}
        value="Age Verification"
      />
      <ListItemNav
        description="Navigate to the Education Degree detail screen"
        onPress={() => handleCredentialPress("ed")}
        value="Education Degree L3"
      />
      <ListItemNav
        description="Navigate to the Education Enrollment detail screen"
        onPress={() => handleCredentialPress("ee")}
        value="Education Enrollment L3"
      />
      <ListItemNav
        description="Navigate to the Residency detail screen"
        onPress={() => handleCredentialPress("res")}
        value="Residency L3"
      />
      <ListItemNav
        description="Navigate to the Education Diploma detail screen"
        onPress={() => handleCredentialPress("edip")}
        value="Education Diploma L3"
      />
      <ListItemNav
        description="Navigate to the Education Attendance detail screen"
        onPress={() => handleCredentialPress("edat")}
        value="Education Attendance L3"
      />
    </View>
  );
};
