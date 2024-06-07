import React from "react";
import { withWalletCardBaseComponent } from "../../../newWallet/components/WalletCardBaseComponent";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => (
  <ItwCredentialCard {...props} />
);

/**
 * Wrapper component which adds wallet capabilites to the ItwCredentialCard component
 */
export const ItwCredentialWalletCard = withWalletCardBaseComponent(
  WrappedItwCredentialCard
);
