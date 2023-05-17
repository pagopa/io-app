import React from "react";
import { IOColors } from "../variables/IOColors";

// Added these verbose names to avoid chaos and misunderstandings
// when using `Quick File Search…`
import PictogramSectionMessages from "./svg/PictogramSectionMessages";
import PictogramSectionPayments from "./svg/PictogramSectionPayments";
import PictogramSectionDocuments from "./svg/PictogramSectionDocuments";
import PictogramSectionServices from "./svg/PictogramSectionServices";
import PictogramSectionProfile from "./svg/PictogramSectionProfile";
import PictogramSectionSettings from "./svg/PictogramSectionSettings";

export const IOSectionPictograms = {
  messages: PictogramSectionMessages /* io-home-messaggi */,
  payments: PictogramSectionPayments,
  documents: PictogramSectionDocuments,
  services: PictogramSectionServices,
  profile: PictogramSectionProfile,
  settings: PictogramSectionSettings
};

export type IOSectionPictogramType = keyof typeof IOSectionPictograms;

type IOSectionPictogramsProps = {
  name: IOSectionPictogramType;
  color?: IOColors;
  size?: number | "100%";
};

const PictogramSection = ({
  name,
  color = "greyLight",
  size = 48,
  ...props
}: IOSectionPictogramsProps) => {
  const SectionPictogramElement = IOSectionPictograms[name];
  return (
    <SectionPictogramElement {...props} size={size} color={IOColors[color]} />
  );
};
export default PictogramSection;
