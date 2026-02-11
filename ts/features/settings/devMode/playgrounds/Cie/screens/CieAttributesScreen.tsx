import { IOButton, VSpacer } from "@pagopa/io-app-design-system";
import { CieManager, type NfcEvent } from "@pagopa/io-react-native-cie";
import { StackActions } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { ReadStatusComponent } from "../components/ReadStatusComponent";
import { useCieNavigation } from "../navigation/CiePlaygroundsNavigator";
import { CIE_PLAYGROUNDS_ROUTES } from "../navigation/routes";
import { ReadStatus } from "../types/ReadStatus";

export const CieAttributesScreen = () => {
  const navigation = useCieNavigation();
  const [status, setStatus] = useState<ReadStatus>("idle");
  const [event, setEvent] = useState<NfcEvent>();

  useHeaderSecondLevel({
    title: "CIE Attributes Reading"
  });

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener("onEvent", setEvent),
      // Start listening for errors
      CieManager.addListener("onError", error => {
        setStatus("error");
        Alert.alert(
          "Error while reading attributes",
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener("onAttributesSuccess", attributes => {
        setStatus("success");
        navigation.dispatch(
          StackActions.replace(CIE_PLAYGROUNDS_ROUTES.RESULT, {
            title: "Attributes",
            data: attributes
          })
        );
      })
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach(remove => remove());
      // Ensure the reading is stopped when the screen is unmounted
      void CieManager.stopReading();
    };
  }, [navigation]);

  const handleStartReading = async () => {
    setEvent(undefined);
    setStatus("reading");

    try {
      await CieManager.startReadingAttributes();
    } catch (e) {
      setStatus("error");
      Alert.alert(
        "Error while reading attributes",
        JSON.stringify(e, undefined, 2)
      );
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setStatus("idle");
    void CieManager.stopReading();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.progressContainer}>
        <ReadStatusComponent
          progress={event?.progress}
          status={status}
          step={event?.name}
        />
      </View>
      <IOButton
        label={status === "reading" ? "Stop reading" : "Start reading"}
        onPress={() =>
          status === "reading" ? handleStopReading() : handleStartReading()
        }
      />
      <VSpacer size={16} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24
  },
  progressContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
