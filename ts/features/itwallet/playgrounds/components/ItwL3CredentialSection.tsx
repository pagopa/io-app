import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { CredentialL3Key } from "../../common/utils/itwMocksUtils.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

export const ItwL3CredentialSection = () => {
  const navigation = useIONavigation();
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);

  const handleCredentialPress = (credentialType: CredentialL3Key) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PLAYGROUNDS.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });
  };

  return (
    <>
      <ListItemHeader label="L3 credentials" />
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
    </>
  );
};
