import {
  H4,
  HStack,
  IOButton,
  IOColors,
  IOVisualCostants,
  Pictogram
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircularProgress } from "../../../../../components/ui/CircularProgress.tsx";
import { IOScrollView } from "../../../../../components/ui/IOScrollView.tsx";
import { ItwProximityMachineContext } from "../machine/provider.tsx";
import { selectIsLoading, selectIsSuccess } from "../machine/selectors.ts";

export const ItwProximityNfcPresentmentScreen = () =>
  Platform.select({
    ios: <IOsContent />,
    default: <AndroidContent />
  });

const IOsContent = () => {
  const insets = useSafeAreaInsets();
  const machineRef = ItwProximityMachineContext.useActorRef();

  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isSuccess = ItwProximityMachineContext.useSelector(selectIsSuccess);

  const handleDismiss = () => {
    machineRef.send({ type: "close" });
  };

  const title = useMemo(() => {
    if (isSuccess) {
      return I18n.t(
        "features.itWallet.presentation.proximity.nfcEngagement.success"
      );
    }

    if (isLoading) {
      return I18n.t(
        "features.itWallet.presentation.proximity.nfcEngagement.sending"
      );
    }

    return I18n.t(
      "features.itWallet.presentation.proximity.nfcEngagement.ready.ios"
    );
  }, [isLoading, isSuccess]);

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.close"),
          onPress: handleDismiss
        }
      }}
    >
      <View style={[styles.container, { marginTop: insets.top }]}>
        <HStack>
          <H4 style={styles.title}>{title} </H4>
          {isSuccess ? <Pictogram name="success" size={120} /> : null}
        </HStack>
      </View>
    </IOScrollView>
  );
};

const AndroidContent = () => {
  const machineRef = ItwProximityMachineContext.useActorRef();

  const isLoading = ItwProximityMachineContext.useSelector(selectIsLoading);
  const isSuccess = ItwProximityMachineContext.useSelector(selectIsSuccess);

  const handleDismiss = () => {
    machineRef.send({ type: "close" });
  };

  const title = useMemo(() => {
    if (isSuccess) {
      return I18n.t(
        "features.itWallet.presentation.proximity.nfcEngagement.success"
      );
    }

    if (isLoading) {
      return I18n.t(
        "features.itWallet.presentation.proximity.nfcEngagement.sending"
      );
    }

    return I18n.t(
      "features.itWallet.presentation.proximity.nfcEngagement.ready.android"
    );
  }, [isLoading, isSuccess]);

  return (
    <IOScrollView centerContent={true}>
      <View style={{ alignItems: "center", gap: 24 }}>
        <CircularProgress
          size={240}
          radius={120}
          progress={isSuccess ? 100 : 0}
          strokeColor={IOColors["blueIO-500"]}
          strokeBgColor={IOColors["grey-200"]}
          strokeWidth={4}
        >
          <Pictogram
            size={180}
            name={isSuccess ? "success" : "nfcScanAndroid"}
          />
        </CircularProgress>
        <H4 textStyle={{ textAlign: "center" }}>{title}</H4>
        <View style={{ alignSelf: "center" }}>
          <IOButton
            label={
              isSuccess
                ? I18n.t("global.buttons.close")
                : I18n.t("global.buttons.cancel")
            }
            variant="link"
            onPress={handleDismiss}
          />
        </View>
      </View>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: IOVisualCostants.headerHeight
  },
  title: {
    flex: 1,
    marginTop: 24
  }
});
