import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useCallback, useMemo } from "react";
import { Alert, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { openAppSettings } from "../../../../../utils/appSettings";
import { ItwProximityMachineContext } from "../machine/provider";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { areProximityPermissionsGranted } from "../utils";
import {
  trackItwProximityBluetoothAccess,
  trackItwProximityBluetoothAccessClose,
  trackItwProximityBluetoothAccessDenied,
  trackItwProximityBluetoothAccessGoToSettings
} from "../analytics";

export const ItwGrantPermissionsScreen = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  const closeFlow = useCallback(() => {
    machineRef.send({ type: "back" });
  }, [machineRef]);

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothAccessClose();
      closeFlow();
    }
  });

  useFocusEffect(trackItwProximityBluetoothAccess);

  const onContinue = useCallback(async () => {
    if (await areProximityPermissionsGranted()) {
      machineRef.send({ type: "continue" });
      return;
    }

    trackItwProximityBluetoothAccessDenied();
    Alert.alert(
      I18n.t(
        "features.itWallet.presentation.proximity.permissionsRequired.alert.title"
      ),
      I18n.t(
        "features.itWallet.presentation.proximity.permissionsRequired.alert.message"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.proximity.permissionsRequired.alert.text"
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
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step1.value"
        ),
        icon:
          Platform.OS === "ios" ? "systemSettingsiOS" : "systemSettingsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step2.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step2.value"
        ),
        icon: "systemAppsAndroid"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step3.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step3.value"
        ),
        icon: "productIOAppBlueBg"
      },
      {
        label: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step4.label"
        ),
        value: I18n.t(
          "features.itWallet.presentation.proximity.grantPermissions.listItems.step4.value"
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
        "features.itWallet.presentation.proximity.grantPermissions.actions.primary"
      ),
      onPress: () => {
        trackItwProximityBluetoothAccessGoToSettings();
        openAppSettings();
      }
    },
    secondary: {
      label: I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.actions.secondary"
      ),
      onPress: onContinue
    }
  };

  return (
    <IOScrollViewWithListItems
      title={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.listItems.title"
      )}
      renderItems={listItems}
      actions={actions}
    />
  );
};
