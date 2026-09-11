import { useIOToast } from "@io-app/design-system";
import { createBrowserInspector } from "@io-app/xstate-inspector";
import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwEidIssuanceMachine } from "./../eid/machine";

const inspector = createBrowserInspector();

export const ItwEidIssuanceMachineContext = createActorContext(
  itwEidIssuanceMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);

export const ItwEidIssuanceMachineProvider = (props: PropsWithChildren) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = getEnv(useIOSelector(selectItwEnv));

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
