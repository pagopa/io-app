import { useIOToast } from "@io-app/design-system";
import { createBrowserInspector } from "@io-app/xstate-inspector";
import { createActorContext } from "@xstate/react";
import { PropsWithChildren } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../store/hooks";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { itwTrustmarkMachine } from "./machine";

const inspector = createBrowserInspector();

type Props = PropsWithChildren<{
  credentialType: string;
}>;

export const ItwTrustmarkMachineContext = createActorContext(
  itwTrustmarkMachine,
  inspector ? { inspect: inspector.inspect } : undefined
);

export const ItwTrustmarkMachineProvider = ({
  credentialType,
  children
}: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = getEnv(useIOSelector(selectItwEnv));
  const itwVersion = useIOSelector(selectItwSpecsVersion);

  return (
    <ItwTrustmarkMachineContext.Provider
      logic={itwTrustmarkMachine}
      options={{
        input: {
          credentialType,
          deps: { env, itwVersion, navigation, store, toast }
        }
      }}
    >
      {children}
    </ItwTrustmarkMachineContext.Provider>
  );
};
