import { ListItemInfo } from "@pagopa/io-app-design-system";
import { useEffect, useMemo } from "react";
import { Alert, Platform } from "react-native";
import I18n from "../../../../../i18n";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { openAppSettings } from "../../../../../utils/appSettings";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ItwProximityMachineContext } from "../machine/provider";
import { selectIsPermissionsRequiredState } from "../machine/selectors";
import { ItwPermissionsWizard } from "../components/ItwPermissionsWizard";

export const ItwGrantPermissionsScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();
  const isPermissionRequiredState = ItwProximityMachineContext.useSelector(
    selectIsPermissionsRequiredState
  );

  useHardwareBackButton(() => true);

  useEffect(() => {
    if (isPermissionRequiredState) {
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
      onPress: openAppSettings
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
    <ItwPermissionsWizard
      title={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.subtitle"
      )}
      listItemHeaderLabel={I18n.t(
        "features.itWallet.presentation.proximity.grantPermissions.listItems.title"
      )}
      listItems={listItems}
      actions={actions}
      onClose={navigation.goBack}
    />
  );
};
