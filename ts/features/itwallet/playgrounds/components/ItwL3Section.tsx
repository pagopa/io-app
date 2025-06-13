import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback } from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../../../features/itwallet/common/store/selectors/preferences";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { CredentialL3Key } from "../../common/utils/itwMocksUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ITW_PLAYGROUND_ROUTES } from "../navigation/routes";

export const ItwL3Section = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();

  const isFiscalCodeWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const navigation = useIONavigation();

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({
      type: "start",
      isL3: true
    });
  }, [machineRef]);

  const handleCredentialPress = (credentialType: CredentialL3Key) => {
    navigation.navigate(ITW_PLAYGROUND_ROUTES.MAIN, {
      screen: ITW_PLAYGROUND_ROUTES.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });
  };

  return (
    <View>
      <ListItemHeader label="IT Wallet (L3)" />
      <ListItemInfo
        label={"Fiscal code whitelisted"}
        value={isFiscalCodeWhitelisted ? "YES" : "NO"}
      />
      <IOButton
        variant="solid"
        color="danger"
        label="Disable L3"
        disabled={!isFiscalCodeWhitelisted}
        onPress={() => {
          dispatch(itwSetFiscalCodeWhitelisted(false));
        }}
      />
      <ListItemHeader label="IT Wallet (L3) screens" />
      <ListItemNav
        value="Discovery L3"
        description="Navigate to the Discovery L3 info screen"
        onPress={navigateToTosL3Screen}
      />
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
    </View>
  );
};
