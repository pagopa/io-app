import {
  H4,
  HeaderSecondLevel,
  IOButton,
  Pictogram
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useLayoutEffect } from "react";
import { Platform, View } from "react-native";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ItwProximityMachineContext } from "../machine/provider.tsx";

export const ItwProximityNfcPresentmentScreen = () => {
  const navigation = useIONavigation();
  const machineRef = ItwProximityMachineContext.useActorRef();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderSecondLevel title={""} type="base" />
    });
  }, [navigation, machineRef]);

  const handleDismiss = () => {
    machineRef.send({ type: "close" });
  };

  return Platform.select({
    ios: (
      <IOScrollView>
        <H4>
          {I18n.t(
            "features.itWallet.presentation.proximity.nfcEngagement.title.ios"
          )}
        </H4>
      </IOScrollView>
    ),
    default: (
      <IOScrollView centerContent={true}>
        <View style={{ alignItems: "center", gap: 24 }}>
          <Pictogram size={180} name={"nfcScanAndroid"} />
          <H4 textStyle={{ textAlign: "center" }}>
            {I18n.t(
              "features.itWallet.presentation.proximity.nfcEngagement.title.android"
            )}
          </H4>
          <View style={{ alignSelf: "center" }}>
            <IOButton
              label={I18n.t(
                "features.itWallet.presentation.proximity.nfcEngagement.cta"
              )}
              variant="link"
              onPress={handleDismiss}
            />
          </View>
        </View>
      </IOScrollView>
    )
  });
};
