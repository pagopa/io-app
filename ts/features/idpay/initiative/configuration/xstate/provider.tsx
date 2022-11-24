import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import {
  IDPAY_API_TEST_TOKEN,
  IDPAY_API_UAT_BASEURL
} from "../../../../../config";
import { useXStateMachine } from "../../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { sessionInfoSelector } from "../../../../../store/reducers/authentication";
import { preferredLanguageSelector } from "../../../../../store/reducers/persistedPreferences";
import { createIDPayWalletClient } from "../../../wallet/api/client";
import { fromLocaleToPreferredLanguage } from "../../../../../utils/locale";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import {
  createIDPayInitiativeConfigurationMachine,
  IDPayInitiativeConfigurationMachineType
} from "./machine";
import { createServicesImplementation } from "./services";
import { createActionsImplementation } from "./actions";

type ConfigurationMachineContext =
  InterpreterFrom<IDPayInitiativeConfigurationMachineType>;

const ConfigurationMachineContext =
  React.createContext<ConfigurationMachineContext>(
    {} as ConfigurationMachineContext
  );

type Props = {
  children: React.ReactNode;
};

const IDPayConfigurationMachineProvider = (props: Props) => {
  const [machine] = useXStateMachine(createIDPayInitiativeConfigurationMachine);

  const sessionInfo = useIOSelector(sessionInfoSelector);

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const token =
    IDPAY_API_TEST_TOKEN !== undefined
      ? IDPAY_API_TEST_TOKEN
      : sessionInfo.value.bpdToken;

  const onboardingClient = createIDPayWalletClient(IDPAY_API_UAT_BASEURL);

  const services = createServicesImplementation(
    onboardingClient,
    token,
    language
  );

  const actions = createActionsImplementation(navigation);

  const machineService = useInterpret(machine, {
    actions,
    services
  });

  return (
    <ConfigurationMachineContext.Provider value={machineService}>
      {props.children}
    </ConfigurationMachineContext.Provider>
  );
};

const useConfigurationMachineService = () =>
  React.useContext(ConfigurationMachineContext);

export { IDPayConfigurationMachineProvider, useConfigurationMachineService };
