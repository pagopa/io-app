import React from "react";
import { SvgProps } from "react-native-svg";
import MdlFront from "../../../../../img/features/itWallet/credential/mdl_front.svg";
import MdlRear from "../../../../../img/features/itWallet/credential/mdl_rear.svg";
import { CredentialType } from "../../common/utils/itwMocksUtils";

export type CredentialCardSide = "front" | "rear";

export type CredentialCardAssets = Record<
  CredentialCardSide,
  React.FC<SvgProps>
>;

export type ItwSkeumorphicCredentialCardProps = {
  type: CredentialType;
  side?: CredentialCardSide;
};

export const ItwSkeumorphicCredentialCard = ({
  type,
  side = "front"
}: ItwSkeumorphicCredentialCardProps) => assetsMap[type]?.[side] ?? null;

const assetsMap: Partial<Record<CredentialType, CredentialCardAssets>> = {
  [CredentialType.DRIVING_LICENSE]: { front: MdlFront, rear: MdlRear }
};
