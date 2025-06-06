import { Alert, Platform } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useEffect, useMemo } from "react";
import I18n from "../../../../../i18n";
import { ItwPermissionsWizard } from "../components/ItwPermissionsWizard";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { ItwProximityMachineContext } from "../machine/provider";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { openBluetoothPreferences } from "../utils";
import { selectIsBluetoothRequiredState } from "../machine/selectors";

export const ItwActivateBluetoothScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isBluetoothRequiredState = ItwProximityMachineContext.useSelector(
    selectIsBluetoothRequiredState
  );

  useEffect(() => {
    if (isBluetoothRequiredState) {
      Alert.alert(
        I18n.t(
          "features.itWallet.presentation.proximity.bluetoothRequired.alert.title"
        ),
        I18n.t(
          "features.itWallet.presentation.proximity.bluetoothRequired.alert.message"
        ),
        [
          {
            text: I18n.t(
              "features.itWallet.presentation.proximity.bluetoothRequired.alert.text"
            ),
            onPress: () => {
              machineRef.send({ type: "close" });
            }
          }
        ]
      );
    }
  }, [isBluetoothRequiredState, machineRef]);

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
      onPress: openBluetoothPreferences
    },
    secondary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.actions.secondary"
      ),
      onPress: () => {
        machineRef.send({ type: "continue" });
        navigation.goBack();
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
