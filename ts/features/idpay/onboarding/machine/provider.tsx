import { createActorContext } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
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
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { createIDPayClient } from "../../common/api/client";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import * as Input from "./input";
import { idPayOnboardingMachine } from "./machine";

type Props = {
  children: React.ReactNode;
  input: Input.Input;
};

export const IdPayOnboardingMachineContext = createActorContext(
  idPayOnboardingMachine
);

export const IdPayOnboardingMachineProvider = ({ children, input }: Props) => {
  const dispatch = useIODispatch();
  const rootNavigation = useIONavigation();

  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const preferredLanguageOption = useIOSelector(preferredLanguageSelector);

  const language = pipe(
    preferredLanguageOption,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const sessionInfo = useIOSelector(sessionInfoSelector);

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken } = sessionInfo.value;

  const token = idPayTestToken !== undefined ? idPayTestToken : bpdToken;
  const client = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const actors = createActorsImplementation(client, token, language);
  const actions = createActionsImplementation(rootNavigation, dispatch);

  const machine = idPayOnboardingMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayOnboardingMachineContext.Provider logic={machine} options={{ input }}>
      {children}
    </IdPayOnboardingMachineContext.Provider>
  );
};
