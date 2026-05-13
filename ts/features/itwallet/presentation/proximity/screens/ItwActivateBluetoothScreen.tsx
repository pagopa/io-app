import { Alert, Platform } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { ItwProximityMachineContext } from "../machine/provider";
import { isBluetoothPoweredOn, openBluetoothPreferences } from "../utils";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  trackItwProximityBluetoothActivation,
  trackItwProximityBluetoothActivationClose,
  trackItwProximityBluetoothActivationGoToSettings,
  trackItwProximityBluetoothNotActivated
} from "../analytics";

export const ItwActivateBluetoothScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  const closeFlow = useCallback(() => {
    machineRef.send({ type: "back" });
  }, [machineRef]);

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothActivationClose();
      closeFlow();
    }
  });

  useFocusEffect(
    useCallback(() => {
      trackItwProximityBluetoothActivation();
    }, [])
  );

  const onContinue = useCallback(async () => {
    if (await isBluetoothPoweredOn()) {
      machineRef.send({ type: "continue" });
      return;
    }

    trackItwProximityBluetoothNotActivated();
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
          onPress: closeFlow
        }
      ]
    );
  }, [machineRef, closeFlow]);

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
      onPress: () => {
        trackItwProximityBluetoothActivationGoToSettings();
        openBluetoothPreferences();
      }
    },
    secondary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.actions.secondary"
      ),
      onPress: onContinue
    }
  };

  return (
    <IOScrollViewWithListItems
      title={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.activateBluetooth.listItems.title"
      )}
      renderItems={listItems}
      actions={actions}
    />
  );
};
