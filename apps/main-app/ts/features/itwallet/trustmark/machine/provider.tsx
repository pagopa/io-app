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
import { itwTrustmarkMachine } from "./machine";

type Props = PropsWithChildren<{
  credentialType: string;
}>;

export const ItwTrustmarkMachineContext =
  createActorContext(itwTrustmarkMachine);

export const ItwTrustmarkMachineProvider = ({
  credentialType,
  children
}: Props) => {
  const store = useIOStore();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const env = pipe(useIOSelector(selectItwEnv), getEnv);
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
