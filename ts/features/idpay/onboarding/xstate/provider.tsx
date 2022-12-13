import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { InterpreterFrom } from "xstate";
import {
  IDPAY_API_TEST_TOKEN,
  IDPAY_API_UAT_BASEURL
} from "../../../../config";
import { useXStateMachine } from "../../../../hooks/useXStateMachine";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../../../utils/locale";
import { createOnboardingClient } from "../api/client";
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

  const sessionInfo = useIOSelector(sessionInfoSelector);

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const token =
    IDPAY_API_TEST_TOKEN !== undefined
      ? IDPAY_API_TEST_TOKEN
      : sessionInfo.value.bpdToken;

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.getOrElse(getLocalePrimaryWithFallback),
    fromLocaleToPreferredLanguage
  );

  const onboardingClient = createOnboardingClient(IDPAY_API_UAT_BASEURL || "");

  const services = createServicesImplementation(
    onboardingClient,
    token,
    language
  );

  const actions = createActionsImplementation(navigation);

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
