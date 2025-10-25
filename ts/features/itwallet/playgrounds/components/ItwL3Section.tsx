import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { useCallback } from "react";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../../../features/itwallet/common/store/selectors/preferences";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { CredentialL3Key } from "../../common/utils/itwMocksUtils";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";

export const ItwL3Section = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const dispatch = useIODispatch();

  const isFiscalCodeWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const isITWalletInstanceValid = useIOSelector(
    itwLifecycleIsITWalletValidSelector
  );
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const navigation = useIONavigation();

  const navigateToTosL3Screen = useCallback(() => {
    machineRef.send({ type: "start", mode: "issuance", level: "l3" });
  }, [machineRef]);

  const handleCredentialPress = (credentialType: CredentialL3Key) => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PLAYGROUNDS.CREDENTIAL_DETAIL,
      params: {
        credentialType
      }
    });
  };

  const confirmL3Disabled = () => {
    Alert.alert(
      I18n.t("features.itWallet.playgrounds.walletL3.alert.title"),
      I18n.t("features.itWallet.playgrounds.walletL3.alert.content"),
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            if (isITWalletInstanceValid) {
              dispatch(itwLifecycleWalletReset());
            }
            dispatch(itwSetFiscalCodeWhitelisted(false));
          }
        }
      ],
      { cancelable: true }
    );
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
        onPress={confirmL3Disabled}
      />
      <VSpacer size={24} />
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
    </View>
  );
};
