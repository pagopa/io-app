/* eslint-disable sonarjs/no-identical-functions */
import {
  IOColors,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Button, ScrollView, View } from "react-native";
import { LabelledItem } from "../../../components/LabelledItem";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { Label } from "../../../components/core/typography/Label";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { Monospace } from "../../../components/core/typography/Monospace";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { IDPayOnboardingRoutes } from "../../../features/idpay/onboarding/navigation/navigator";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { isDevEnv } from "../../../utils/environment";

const IdPayOnboardingPlayground = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [serviceId, setServiceId] = React.useState<string | undefined>();

  const navigateToIDPayOnboarding = (serviceId: string) => {
    navigation.navigate(IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN, {
      screen: IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
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

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Playground"}>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        <LabelledItem
          label={"Service ID"}
          inputProps={{
            keyboardType: "default",
            returnKeyType: "done",
            autoFocus: true,
            onChangeText: text => setServiceId(text),
            value: serviceId
          }}
        />
        <VSpacer size={16} />
        <Button onPress={handleServiceSubmit} title="Start onboarding" />
        {isDevEnv && (
          <>
            <VSpacer size={24} />
            <H2>Iniziative di test</H2>
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
    </BaseScreenComponent>
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
    label: "KO - Generico",
    willFail: true
  },
  {
    serviceId: "TESTSRV07",
    label: "KO - Iniziativa non iniziata",
    willFail: true
  },
  {
    serviceId: "TESTSRV08",
    label: "KO - Iniziativa conclusa",
    willFail: true
  },
  {
    serviceId: "TESTSRV09",
    label: "KO - Budget terminato",
    willFail: true
  },
  {
    serviceId: "TESTSRV10",
    label: "KO - Requisiti non soddisfatti",
    willFail: true
  },
  {
    serviceId: "TESTSRV11",
    label: "KO - Non in whitelist",
    willFail: true
  },
  {
    serviceId: "TESTSRV12",
    label: "KO - In valutazione",
    willFail: true
  },
  {
    serviceId: "TESTSRV13",
    label: "KO - Non ammissibile",
    willFail: true
  },
  {
    serviceId: "TESTSRV14",
    label: "KO - Utente già ammesso",
    willFail: true
  },
  {
    serviceId: "TESTSRV15",
    label: "KO - Recesso",
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
            <Label color="bluegrey">
              {label} <LabelSmall>{willFail ? "❌" : "✅"}</LabelSmall>
            </Label>
          </View>
          <Monospace selectable>{serviceId}</Monospace>
        </View>
      </PressableListItemBase>
    </View>
  );
};

export default IdPayOnboardingPlayground;
