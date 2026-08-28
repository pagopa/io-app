import { useIOToast } from "@io-app/design-system";
import { createActorContext } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwEidIssuanceMachine } from "./../eid/machine";

export const ItwEidIssuanceMachineContext = createActorContext(
  itwEidIssuanceMachine
);

export const ItwEidIssuanceMachineProvider = (props: PropsWithChildren) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);

  return (
    <ItwEidIssuanceMachineContext.Provider
      logic={itwEidIssuanceMachine}
      options={{
        input: {
          deps: { env, navigation, store, toast }
        }
      }}
    >
      {props.children}
    </ItwEidIssuanceMachineContext.Provider>
  );
};
