import { createActorContext } from "@xstate/react5";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
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
import { idPayUnsubscriptionMachine } from "./machine";

export const IdPayUnsubscriptionMachineContext = createActorContext(
  idPayUnsubscriptionMachine
);

type Props = {
  children: React.ReactNode;
  initiativeId: string;
  initiativeName?: string;
  initiativeType?: InitiativeRewardTypeEnum;
};

export const IDPayUnsubscriptionMachineProvider = ({ children }: Props) => {
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

  const idPayToken = idPayTestToken ?? bpdToken;
  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const actors = createActorsImplementation(idPayClient, idPayToken, language);
  const actions = createActionsImplementation(navigation, dispatch);
  const machine = idPayUnsubscriptionMachine.provide({
    actors,
    actions
  });

  return (
    <IdPayUnsubscriptionMachineContext.Provider logic={machine}>
      {children}
    </IdPayUnsubscriptionMachineContext.Provider>
  );
};
