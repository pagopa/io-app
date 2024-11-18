import { createActorContext } from "@xstate/react";
import React from "react";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwTrustmarkMachine } from "./machine";

type Props = {
  credential: StoredCredential;
  children: JSX.Element;
};

export const ItwTrustmarkMachineContext =
  createActorContext(itwTrustmarkMachine);

export const ItwTrustmarkMachineProvider = (props: Props) => {
  const { credential, children } = props;

  const trustmarkMachine = itwTrustmarkMachine.provide({});

  return (
    <ItwTrustmarkMachineContext.Provider
      logic={trustmarkMachine}
      options={{ input: { credential } }}
    >
      {children}
    </ItwTrustmarkMachineContext.Provider>
  );
};
