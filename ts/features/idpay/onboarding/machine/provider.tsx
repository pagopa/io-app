import { createActorContext } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { ReactNode } from "react";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayApiUatVersion,
  idPayApiVersion,
  idPayTestToken
} from "../../../../config";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { bpdTokenSelector } from "../../../authentication/common/store/selectors";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import { fromLocaleToPreferredLanguage } from "../../../../utils/locale";
import { createIDPayClient } from "../../common/api/client";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import { idPayOnboardingMachine } from "./machine";

type Props = {
  children: ReactNode;
};

export const IdPayOnboardingMachineContext = createActorContext(
  idPayOnboardingMachine
);

export const IdPayOnboardingMachineProvider = ({ children }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const bpdToken = useIOSelector(bpdTokenSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const preferredLanguageOption = useIOSelector(preferredLanguageSelector);
  const apiVersion = isPagoPATestEnabled ? idPayApiUatVersion : idPayApiVersion;

  const language = pipe(
    preferredLanguageOption,
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  if (!bpdToken) {
    throw new Error("BDP token is undefined");
  }

  const token = idPayTestToken ?? bpdToken;
  const client = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl,
    apiVersion
  );

  const actors = createActorsImplementation(client, token, language);
  const actions = createActionsImplementation(navigation, dispatch);

  const machine = idPayOnboardingMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayOnboardingMachineContext.Provider logic={machine}>
      {children}
    </IdPayOnboardingMachineContext.Provider>
  );
};
