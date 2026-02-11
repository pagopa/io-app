import {
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VStack
} from "@pagopa/io-app-design-system";
import { CieLogger, CieUtils } from "@pagopa/io-react-native-cie";
import { Fragment, useCallback, useState } from "react";
import { Alert, Platform } from "react-native";
import { IOScrollView } from "../../../../../../components/ui/IOScrollView";
import { useAppStateActive } from "../../../../../../hooks/useAppStateActive";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { useCieNavigation } from "../navigation/CiePlaygroundsNavigator";
import { CIE_PLAYGROUNDS_ROUTES } from "../navigation/routes";

export const CiePlaygrounds = () => {
  const navigation = useCieNavigation();
  const [hasNFC, setHasNFC] = useState<boolean | undefined>();
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | undefined>();
  const [isCieAuthenticationSupported, setIsCieAuthenticationSupported] =
    useState<boolean | undefined>();

  useHeaderSecondLevel({
    title: "CIE Playgrounds"
  });

  useAppStateActive(
    useCallback(async () => {
      setHasNFC(await CieUtils.hasNfcFeature());
      setIsNFCEnabled(await CieUtils.isNfcEnabled());
      setIsCieAuthenticationSupported(
        await CieUtils.isCieAuthenticationSupported()
      );
    }, [])
  );

  const obtainLogs = async () => {
    if (Platform.OS === "ios") {
      try {
        const logs = await CieLogger.getLogs();
        navigation.navigate(CIE_PLAYGROUNDS_ROUTES.RESULT, {
          title: "Logs",
          data: logs
        });
      } catch (e) {
        Alert.alert(
          "Error while obtaining logs",
          JSON.stringify(e, undefined, 2)
        );
      }
    }
  };

  const infos = [
    { label: "Has NFC", value: hasNFC },
    { label: "Is NFC enabled", value: isNFCEnabled },
    {
      label: "CIE authentication supported",
      value: isCieAuthenticationSupported
    }
  ];

  const tests: ReadonlyArray<ListItemNav> = [
    {
      value: "Read CIE attributes",
      icon: "creditCard",
      onPress: () => navigation.navigate(CIE_PLAYGROUNDS_ROUTES.ATTRIBUTES)
    },
    {
      value: "Read CIE certificate",
      icon: "creditCard",
      onPress: () =>
        navigation.navigate(CIE_PLAYGROUNDS_ROUTES.CERTIFICATE_READING)
    },
    {
      value: "Start CIE Auth",
      icon: "cieLetter",
      onPress: () => navigation.navigate(CIE_PLAYGROUNDS_ROUTES.AUTHENTICATION)
    },
    {
      value: "Start CIE Internal Auth",
      icon: "selfCert",
      onPress: () => navigation.navigate(CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH)
    },
    {
      value: "Start MRTD with PACE reading",
      icon: "fiscalCodeIndividual",
      onPress: () => navigation.navigate(CIE_PLAYGROUNDS_ROUTES.MRTD)
    },
    {
      value: "Start CIE Internal Auth + MRTD reading",
      icon: "navWalletFocused",
      onPress: () =>
        navigation.navigate(CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH_MRTD)
    }
  ];

  return (
    <IOScrollView>
      <ListItemHeader label="Device info" />
      {infos.map((info, index) => (
        <Fragment key={`home-screen-info-fragment-${info.label}-${index}`}>
          {index !== 0 && <Divider />}
          <ListItemInfo
            value={info.label}
            endElement={{
              type: "badge",
              componentProps: {
                text: info.value ? "🟢 OK" : "🔴 KO",
                variant: info.value ? "success" : "error"
              }
            }}
          />
        </Fragment>
      ))}
      <ListItemHeader label="Tests" />
      <VStack space={4}>
        {tests.map((item, index) => (
          <Fragment key={`home-screen-fragment-${item.value}-${index}`}>
            {index !== 0 && <Divider />}
            <ListItemNav {...item} />
          </Fragment>
        ))}
        {Platform.OS === "android" && (
          <>
            <Divider />
            <ListItemNav
              value="Open NFC Settings"
              icon="coggle"
              onPress={() => CieUtils.openNfcSettings()}
            />
          </>
        )}
        {Platform.OS === "ios" && (
          <>
            <Divider />
            <ListItemNav
              value="View logs"
              icon="docAttach"
              onPress={obtainLogs}
            />
          </>
        )}
      </VStack>
    </IOScrollView>
  );
};
