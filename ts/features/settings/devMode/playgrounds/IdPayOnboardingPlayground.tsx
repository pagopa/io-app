import {
  Body,
  BodyMonospace,
  BodySmall,
  H4,
  IOColors,
  IOVisualCostants,
  PressableListItemBase,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Button, ScrollView, View } from "react-native";
import { IdPayOnboardingRoutes } from "../../../idpay/onboarding/navigation/routes";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { isDevEnv } from "../../../../utils/environment";

const IdPayOnboardingPlayground = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [serviceId, setServiceId] = useState<string | undefined>();

  const navigateToIDPayOnboarding = (serviceId: string) => {
    navigation.navigate(IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
      params: {
        serviceId
      }
    });
  };

  const handleServiceSubmit = () => {
    if (serviceId !== undefined && serviceId !== "") {
      navigateToIDPayOnboarding(serviceId);
    }
  };

  useHeaderSecondLevel({
    title: "Playground",
    canGoBack: true
  });

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        flexGrow: 1
      }}
    >
      <TextInput
        accessibilityLabel="ID dell'iniziativa"
        onChangeText={text => setServiceId(text)}
        value={serviceId ?? ""}
        placeholder="Service ID"
      />
      <VSpacer size={16} />
      <Button onPress={handleServiceSubmit} title="Start onboarding" />
      {isDevEnv && (
        <>
          <VSpacer size={24} />
          <H4>Iniziative di test</H4>
          <Body>Iniziative disponibili tramite io-dev-server</Body>
          {testServices.map(srv => (
            <TestServiceItem
              key={srv.serviceId}
              service={srv}
              onPress={() => navigateToIDPayOnboarding(srv.serviceId)}
            />
          ))}
        </>
      )}
      <VSpacer size={32} />
    </ScrollView>
  );
};

type TestService = {
  serviceId: string;
  label: string;
  willFail?: boolean;
};

const testServices: ReadonlyArray<TestService> = [
  {
    serviceId: "TESTSRV01",
    label: "Flusso completo"
  },
  {
    serviceId: "TESTSRV02",
    label: "Iniziativa con invito"
  },
  {
    serviceId: "TESTSRV03",
    label: "Senza prerequisiti"
  },
  {
    serviceId: "TESTSRV04",
    label: "Solo PDND"
  },
  {
    serviceId: "TESTSRV05",
    label: "Solo autodichiarazioni"
  },
  {
    serviceId: "TESTSRV06",
    label: "Iniziativa GUIDONIA"
  },
  {
    serviceId: "TESTSRV07",
    label: "Bonus Elettrodomestici"
  },
  {
    serviceId: "TESTSRV08",
    label: "KO - Generico",
    willFail: true
  },
  {
    serviceId: "TESTSRV09",
    label: "KO - Iniziativa non iniziata",
    willFail: true
  },
  {
    serviceId: "TESTSRV10",
    label: "KO - Iniziativa conclusa",
    willFail: true
  },
  {
    serviceId: "TESTSRV11",
    label: "KO - Budget terminato",
    willFail: true
  },
  {
    serviceId: "TESTSRV12",
    label: "KO - Requisiti non soddisfatti",
    willFail: true
  },
  {
    serviceId: "TESTSRV13",
    label: "KO - Non in whitelist",
    willFail: true
  },
  {
    serviceId: "TESTSRV14",
    label: "KO - In valutazione",
    willFail: true
  },
  {
    serviceId: "TESTSRV15",
    label: "KO - Non ammissibile",
    willFail: true
  },
  {
    serviceId: "TESTSRV16",
    label: "KO - Utente già ammesso",
    willFail: true
  },
  {
    serviceId: "TESTSRV17",
    label: "KO - Recesso",
    willFail: true
  },
  {
    serviceId: "TESTSRV18",
    label: "KO - In lista d'attesa",
    willFail: true
  },
  {
    serviceId: "TESTSRV19",
    label: "KO - Famiglia già iscritta",
    willFail: true
  },
  {
    serviceId: "TESTSRV20",
    label: "KO - Troppe richieste",
    willFail: true
  }
];

type TestServiceItemProps = {
  service: TestService;
  onPress: () => void;
};

const TestServiceItem = (props: TestServiceItemProps) => {
  const { label, serviceId, willFail } = props.service;
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: IOColors["grey-100"]
      }}
    >
      <PressableListItemBase onPress={props.onPress}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Body weight="Semibold">
              {label}{" "}
              <BodySmall weight="Semibold">{willFail ? "❌" : "✅"}</BodySmall>
            </Body>
          </View>
          <BodyMonospace selectable>{serviceId}</BodyMonospace>
        </View>
      </PressableListItemBase>
    </View>
  );
};

export default IdPayOnboardingPlayground;
