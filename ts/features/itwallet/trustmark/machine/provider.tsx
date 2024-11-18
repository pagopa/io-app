import { createActorContext } from "@xstate/react";
import React from "react";
import { useIOStore } from "../../../../store/hooks";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { createItwTrustmarkActorsImplementation } from "./actors";
import { itwTrustmarkMachine } from "./machine";

type Props = {
  credential: StoredCredential;
  children: JSX.Element;
};

export const ItwTrustmarkMachineContext =
  createActorContext(itwTrustmarkMachine);

export const ItwTrustmarkMachineProvider = (props: Props) => {
  const { credential, children } = props;

  const store = useIOStore();

  const trustmarkMachine = itwTrustmarkMachine.provide({
    actors: createItwTrustmarkActorsImplementation(store)
  });

  return (
    <ItwTrustmarkMachineContext.Provider
      logic={trustmarkMachine}
      options={{ input: { credential } }}
    >
      {children}
    </ItwTrustmarkMachineContext.Provider>
  );
};
