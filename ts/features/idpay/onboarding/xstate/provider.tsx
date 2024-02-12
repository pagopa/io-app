import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { InterpreterFrom } from "xstate";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../../../utils/locale";
import { useXStateMachine } from "../../../../xstate/hooks/useXStateMachine";
import { createIDPayClient } from "../../common/api/client";
import {
  IDPayOnboardingParamsList,
  IDPayOnboardingStackNavigationProp
} from "../navigation/navigator";
import { createActionsImplementation } from "./actions";
import {
  IDPayOnboardingMachineType,
  createIDPayOnboardingMachine
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
  const dispatch = useIODispatch();
  const [machine] = useXStateMachine(createIDPayOnboardingMachine);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;

  const sessionInfo = useIOSelector(sessionInfoSelector);

  const rootNavigation = useIONavigation();
  const onboardingNavigation =
    useNavigation<
      IDPayOnboardingStackNavigationProp<
        IDPayOnboardingParamsList,
        keyof IDPayOnboardingParamsList
      >
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

  const client = createIDPayClient(baseUrl);

  const services = createServicesImplementation(client, token, language);

  const actions = createActionsImplementation(
    rootNavigation,
    onboardingNavigation,
    dispatch
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
