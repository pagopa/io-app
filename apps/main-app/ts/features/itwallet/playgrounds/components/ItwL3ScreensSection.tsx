import { ListItemHeader, ListItemNav } from "@io-app/design-system";
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
        label="IT-Wallet ID (PID)"
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
          })
        }
      />
      <ListItemNav
        description="Navigate to the Driving License detail screen"
        label="Driving License L3"
        onPress={() => handleCredentialPress("mdl")}
      />
      {isItwValid && (
        <ListItemNav
          description="Navigate to the EHIC detail screen"
          label="EU Health Insurance Card L3"
          onPress={() => handleCredentialPress("ts")}
        />
      )}
      <ListItemNav
        description="Navigate to the Disability Card detail screen"
        label="Disability Card L3"
        onPress={() => handleCredentialPress("dc")}
      />
      <ListItemNav
        description="Navigate to the Proof of Age detail screen"
        label="Proof of Age"
        onPress={() => handleCredentialPress("proofOfAge")}
      />
      <ListItemNav
        description="Navigate to the Education Degree detail screen"
        label="Education Degree L3"
        onPress={() => handleCredentialPress("ed")}
      />
      <ListItemNav
        description="Navigate to the Education Enrollment detail screen"
        label="Education Enrollment L3"
        onPress={() => handleCredentialPress("ee")}
      />
      <ListItemNav
        description="Navigate to the Residency detail screen"
        label="Residency L3"
        onPress={() => handleCredentialPress("res")}
      />
      <ListItemNav
        description="Navigate to the Education Diploma detail screen"
        label="Education Diploma L3"
        onPress={() => handleCredentialPress("edip")}
      />
      <ListItemNav
        description="Navigate to the Education Attendance detail screen"
        label="Education Attendance L3"
        onPress={() => handleCredentialPress("edat")}
      />
    </View>
  );
};
