import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import {
  idPayTestToken,
  idPayApiUatBaseUrl,
  idPayApiBaseUrl
} from "../../../../config";
import { useXStateMachine } from "../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../../../utils/locale";
import { createOnboardingClient } from "../api/client";
import {
  IDPayOnboardingParamsList,
  IDPayOnboardingStackNavigationProp
} from "../navigation/navigator";
import { createActionsImplementation } from "./actions";
import {
  createIDPayOnboardingMachine,
  IDPayOnboardingMachineType
} from "./machine";
import { createServicesImplementation } from "./services";

type OnboardingMachineContext = InterpreterFrom<IDPayOnboardingMachineType>;

const OnboardingMachineContext = React.createContext<OnboardingMachineContext>(
  {} as OnboardingMachineContext
);

type Props = {
  children: React.ReactNode;
};

const IDPayOnboardingMachineProvider = (props: Props) => {
  const [machine] = useXStateMachine(createIDPayOnboardingMachine);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;

  const sessionInfo = useIOSelector(sessionInfoSelector);

  const rootNavigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const onboardingNavigation =
    useNavigation<
      IDPayOnboardingStackNavigationProp<IDPayOnboardingParamsList>
    >();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken } = sessionInfo.value;

  const token = idPayTestToken !== undefined ? idPayTestToken : bpdToken;

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.getOrElse(getLocalePrimaryWithFallback),
    fromLocaleToPreferredLanguage
  );

  const onboardingClient = createOnboardingClient(baseUrl);

  const services = createServicesImplementation(
    onboardingClient,
    token,
    language
  );

  const actions = createActionsImplementation(
    rootNavigation,
    onboardingNavigation
  );

  const machineService = useInterpret(machine, {
    services,
    actions
  });

  return (
    <OnboardingMachineContext.Provider value={machineService}>
      {props.children}
    </OnboardingMachineContext.Provider>
  );
};

const useOnboardingMachineService = () =>
  React.useContext(OnboardingMachineContext);

export { IDPayOnboardingMachineProvider, useOnboardingMachineService };
