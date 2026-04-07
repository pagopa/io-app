import {
  IOButton,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Alert, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { itwLifecycleWalletReset } from "../../lifecycle/store/actions";
import {
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "../../lifecycle/store/selectors";

export const ItwLifecycleSection = () => {
  const dispatch = useIODispatch();

  const isItwInstalled = useIOSelector(itwLifecycleIsInstalledSelector);
  const isItwOperational = useIOSelector(itwLifecycleIsOperationalSelector);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isFiscalCodeWhitelisted = useIOSelector(itwIsL3EnabledSelector);
  const isITWalletInstanceValid = useIOSelector(
    itwLifecycleIsITWalletValidSelector
  );

  const getLifecycleStateLabel = () => {
    if (isItwInstalled) {
      return "INSTALLED";
    } else if (isItwOperational) {
      return "OPERATIONAL";
    } else if (isItwValid) {
      return "VALID";
    } else {
      return "UNKNOWN";
    }
  };

  const confirmDisableL3Whitelist = () => {
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
      <ListItemHeader label="Wallet Instance" />
      <ListItemInfo label="Lifecycle status" value={getLifecycleStateLabel()} />
      <ListItemHeader label="L3 Whitelist" />
      <ListItemInfo
        label="Fiscal code whitelisted"
        value={isFiscalCodeWhitelisted ? "YES" : "NO"}
      />
      <IOButton
        variant="solid"
        color="danger"
        label="Disable L3 whitelist"
        disabled={!isFiscalCodeWhitelisted}
        onPress={confirmDisableL3Whitelist}
      />
    </View>
  );
};
