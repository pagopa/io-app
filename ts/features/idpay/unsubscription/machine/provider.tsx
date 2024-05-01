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
import { idPayUnsubscriptionMachine } from "./machine";

type Props = {
  children: React.ReactNode;
  input: Input.Input;
};

export const IdPayUnsubscriptionMachineContext = createActorContext(
  idPayUnsubscriptionMachine
);

export const IdPayUnsubscriptionMachineProvider = ({
  children,
  input
}: Props) => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const sessionInfo = useIOSelector(sessionInfoSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const preferredLanguageOption = useIOSelector(preferredLanguageSelector);

  const language = pipe(
    preferredLanguageOption,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }
  const { bpdToken } = sessionInfo.value;

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const actors = createActorsImplementation(
    idPayClient,
    idPayTestToken ?? bpdToken,
    language,
    dispatch
  );
  const actions = createActionsImplementation(navigation);
  const machine = idPayUnsubscriptionMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayUnsubscriptionMachineContext.Provider
      logic={machine}
      options={{ input }}
    >
      {children}
    </IdPayUnsubscriptionMachineContext.Provider>
  );
};
