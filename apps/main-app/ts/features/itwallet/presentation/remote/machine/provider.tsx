import { createActorContext } from "@xstate/react";
import { JSX } from "react";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector, useIOStore } from "../../../../../store/hooks.ts";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../../common/store/selectors/environment.ts";
import { getEnv } from "../../../common/utils/environment.ts";
import { itwRemoteMachine } from "./machine.ts";

type Props = {
  children: JSX.Element;
};

export const ItwRemoteMachineContext = createActorContext(itwRemoteMachine);

export const ItwRemoteMachineProvider = (props: Props) => {
  const navigation = useIONavigation();
  const store = useIOStore();
  const env = getEnv(useIOSelector(selectItwEnv));
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  return (
    <ItwRemoteMachineContext.Provider
      logic={itwRemoteMachine}
      options={{
        input: { deps: { env, itwVersion, navigation, store } }
      }}
    >
      {props.children}
    </ItwRemoteMachineContext.Provider>
  );
};
