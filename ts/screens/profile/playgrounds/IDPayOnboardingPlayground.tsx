/* eslint-disable sonarjs/no-identical-functions */
import { useNavigation } from "@react-navigation/native";
import { ListItem as NBListItem } from "native-base";
import React from "react";
import { Button, ScrollView, View } from "react-native";
import { LabelledItem } from "../../../components/LabelledItem";
import { VSpacer } from "../../../components/core/spacer/Spacer";
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

const IDPayOnboardingPlayground = () => {
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
    label: "No criteri di ammissione",
    willFail: true
  },
  {
    serviceId: "TESTSRV07",
    label: "No requisiti",
    willFail: true
  },
  {
    serviceId: "TESTSRV08",
    label: "Onboarding già concluso",
    willFail: true
  },
  {
    serviceId: "TESTSRV09",
    label: "Recesso",
    willFail: true
  },
  {
    serviceId: "TESTSRV10",
    label: "Applicazione in valutazione",
    willFail: true
  },
  {
    serviceId: "TESTSRV11",
    label: "Budget terminato",
    willFail: true
  },
  {
    serviceId: "TESTSRV12",
    label: "Periodo di iscrizione terminato",
    willFail: true
  },
  {
    serviceId: "TESTSRV13",
    label: "Periodo di iscrizione non iniziato",
    willFail: true
  },
  {
    serviceId: "TESTSRV14",
    label: "Iniziativa sospesa",
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
    <NBListItem onPress={props.onPress}>
      <View>
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
    </NBListItem>
  );
};

export default IDPayOnboardingPlayground;
