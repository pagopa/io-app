import React from "react";
import { IOColors } from "../variables/IOColors";

/* Icons */
import IconBiomFingerprint from "./svg/IconBiomFingerprint";
import IconBiomFaceID from "./svg/IconBiomFaceID";

export const IOBiometricIcons = {
  fingerprint: IconBiomFingerprint /* io-fingerprint */,
  faceID: IconBiomFaceID /* io-face-id */
} as const;

export type IOBiometricIconType = keyof typeof IOBiometricIcons;

type IOBiometricIconsProps = {
  name: IOBiometricIconType;
  color?: IOColors;
  size?: number | "100%";
};

const IconBiometric = ({
  name,
  color = "bluegrey",
  size = 56,
  ...props
}: IOBiometricIconsProps) => {
  const IconElement = IOBiometricIcons[name];
  return <IconElement {...props} size={size} color={IOColors[color]} />;
};

export default IconBiometric;
