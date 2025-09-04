import { Alert, Platform } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useCallback, useEffect, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { ItwProximityMachineContext } from "../machine/provider";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { openBluetoothPreferences } from "../utils";
import { selectIsBluetoothRequiredState } from "../machine/selectors";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  trackItwProximityBluetoothActivation,
  trackItwProximityBluetoothActivationClose,
  trackItwProximityBluetoothActivationGoToSettings,
  trackItwProximityBluetoothNotActivated
} from "../analytics";

export const ItwActivateBluetoothScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isBluetoothRequiredState = ItwProximityMachineContext.useSelector(
    selectIsBluetoothRequiredState
  );

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothActivationClose();
      navigation.goBack();
    }
  });

  useFocusEffect(
    useCallback(() => {
      trackItwProximityBluetoothActivation();
    }, [])
  );

  useEffect(() => {
    if (isBluetoothRequiredState) {
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
      onPress: () => {
        trackItwProximityBluetoothActivationGoToSettings();
        openBluetoothPreferences();
      }
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
