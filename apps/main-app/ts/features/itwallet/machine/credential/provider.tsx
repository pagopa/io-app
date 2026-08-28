import { useIOToast } from "@io-app/design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwCredentialIssuanceMachine } from "./machine.ts";

export const ItwCredentialIssuanceMachineContext = createActorContext(
  itwCredentialIssuanceMachine
);

export const ItwCredentialIssuanceMachineProvider = (
  props: PropsWithChildren
) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  return (
    <ItwCredentialIssuanceMachineContext.Provider
      logic={itwCredentialIssuanceMachine}
      options={{
        input: {
          deps: { env, itwVersion, navigation, store, toast }
        }
      }}
    >
      {props.children}
    </ItwCredentialIssuanceMachineContext.Provider>
  );
};
