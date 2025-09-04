import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useEffect, useMemo } from "react";
import { Alert, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { openAppSettings } from "../../../../../utils/appSettings";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectIsPermissionsRequiredState } from "../machine/selectors";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import {
  trackItwProximityBluetoothAccess,
  trackItwProximityBluetoothAccessClose,
  trackItwProximityBluetoothAccessDenied,
  trackItwProximityBluetoothAccessGoToSettings
} from "../analytics";

export const ItwGrantPermissionsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isPermissionRequiredState = ItwProximityMachineContext.useSelector(
    selectIsPermissionsRequiredState
  );

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      trackItwProximityBluetoothAccessClose();
      navigation.goBack();
    }
  });

  useFocusEffect(trackItwProximityBluetoothAccess);

  useEffect(() => {
    if (isPermissionRequiredState) {
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
            onPress: () => {
              machineRef.send({ type: "close" });
            }
          }
        ]
      );
    }
  }, [isPermissionRequiredState, machineRef]);

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
      onPress: () => {
        machineRef.send({ type: "continue" });
        navigation.goBack();
      }
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
