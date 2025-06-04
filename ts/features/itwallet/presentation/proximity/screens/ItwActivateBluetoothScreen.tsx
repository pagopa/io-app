import { Platform } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import I18n from "../../../../../i18n";
import { ItwPermissionsWizard } from "../components/ItwPermissionsWizard";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { openAppSettings } from "../../../../../utils/appSettings";
import { ItwProximityMachineContext } from "../machine/provider";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export const ItwActivateBluetoothScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();
  const navigation = useIONavigation();

  const listItems = useMemo<Array<ListItemInfo>>(
    () => [
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step1.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step1.value"
        ),
        icon:
          Platform.OS === "ios" ? "systemSettingsiOS" : "systemSettingsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step2.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step2.value"
        ),
        icon: "systemAppsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step3.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.activateBluetooth.listItems.step3.value"
        ),
        icon: "systemToggleInstructions"
      }
    ],
    []
  );

  const actions: IOScrollViewActions = {
    type: "TwoButtons",
    primary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.actions.primary"
      ),
      onPress: openAppSettings
    },
    secondary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.actions.secondary"
      ),
      onPress: () => {
        machineRef.send({ type: "continue" });
      }
    }
  };

  return (
    <ItwPermissionsWizard
      title={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.listItems.title"
      )}
      listItems={listItems}
      actions={actions}
      onClose={navigation.goBack}
    />
  );
};
