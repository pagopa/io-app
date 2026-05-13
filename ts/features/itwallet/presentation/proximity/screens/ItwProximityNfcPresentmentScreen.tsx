import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useLayoutEffect } from "react";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";

export const ItwProximityNfcPresentmentScreen = () => {
  const navigation = useIONavigation();

  const machineRef = ItwProximityMachineContext.useActorRef();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => machineRef.send({ type: "close" })
          }}
        />
      )
    });
  }, [navigation, machineRef]);

  return <IOScrollView />;
};
