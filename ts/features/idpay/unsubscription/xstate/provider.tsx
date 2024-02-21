import { useInterpret } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { InterpreterFrom } from "xstate";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import { useXStateMachine } from "../../../../xstate/hooks/useXStateMachine";
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
import {
  IDPayUnsubscriptionMachineType,
  createIDPayUnsubscriptionMachine
} from "./machine";
import { createServicesImplementation } from "./services";

type UnsubscriptionMachineContext =
  InterpreterFrom<IDPayUnsubscriptionMachineType>;

const UnsubscriptionMachineContext =
  React.createContext<UnsubscriptionMachineContext>(
    {} as UnsubscriptionMachineContext
  );

type Props = {
  children: React.ReactNode;
  initiativeId: string;
  initiativeName?: string;
  initiativeType?: InitiativeRewardTypeEnum;
};

const IDPayUnsubscriptionMachineProvider = (props: Props) => {
  const { initiativeId, initiativeName, initiativeType } = props;

  const dispatch = useIODispatch();
  const [machine] = useXStateMachine(() =>
    createIDPayUnsubscriptionMachine({
      initiativeId,
      initiativeName,
      initiativeType
    })
  );

  const sessionInfo = useIOSelector(sessionInfoSelector);
  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.map(fromLocaleToPreferredLanguage),
    O.getOrElse(() => PreferredLanguageEnum.it_IT)
  );

  const navigation = useIONavigation();

  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const { bpdToken } = sessionInfo.value;

  const idPayToken = idPayTestToken ?? bpdToken;

  const idPayClient = createIDPayClient(
    isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl
  );

  const services = createServicesImplementation(
    idPayClient,
    idPayToken,
    language
  );

  const actions = createActionsImplementation(navigation, dispatch);

  const machineService = useInterpret(machine, {
    actions,
    services
  });

  return (
    <UnsubscriptionMachineContext.Provider value={machineService}>
      {props.children}
    </UnsubscriptionMachineContext.Provider>
  );
};

const useUnsubscriptionMachineService = () =>
  React.useContext(UnsubscriptionMachineContext);

export {
  IDPayUnsubscriptionMachineProvider,
  UnsubscriptionMachineContext,
  useUnsubscriptionMachineService
};
