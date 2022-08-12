import React from "react";
import { ColorValue } from "react-native";
import { IOColors, IOColorType } from "../variables/IOColors";

import PictogramAirBaloon from "./svg/PictogramAirBaloon";
import PictogramHeart from "./svg/PictogramHeart";
import PictogramCompleted from "./svg/PictogramCompleted";
import PictogramEmailValidation from "./svg/PictogramEmailValidation";
import PictogramAbacus from "./svg/PictogramAbacus";
import PictogramPiggyBank from "./svg/PictogramPiggyBank";
import PictogramProcessing from "./svg/PictogramProcessing";
import PictogramBaloons from "./svg/PictogramBaloons";
import PictogramPlaces from "./svg/PictogramPlaces";
import PictogramNotAvailable from "./svg/PictogramNotAvailable";
import PictogramAirship from "./svg/PictogramAirship";
import PictogramSearch from "./svg/PictogramSearch";
import PictogramUnrecognized from "./svg/PictogramUnrecognized";
import PictogramError from "./svg/PictogramError";
import PictogramUmbrella from "./svg/PictogramUmbrella";
import PictogramInProgress from "./svg/PictogramInProgress";
import PictogramFireworks from "./svg/PictogramFireworks";
import PictogramPuzzle from "./svg/PictogramPuzzle";
import PictogramQuestion from "./svg/PictogramQuestion";
import PictogramPin from "./svg/PictogramPin";
import PictogramTimeout from "./svg/PictogramTimeout";
import PictogramUploadFile from "./svg/PictogramUploadFile";
import PictogramHourglass from "./svg/PictogramHourglass";
import PictogramTeaBreak from "./svg/PictogramTeaBreak";
import PictogramSms from "./svg/PictogramSms";
import PictogramCondom from "./svg/PictogramCondom";
import PictogramInbox from "./svg/PictogramInbox";

export const IOPictograms = {
  airBaloon: PictogramAirBaloon,
  abacus: PictogramAbacus,
  emailValidation: PictogramEmailValidation,
  inbox: PictogramInbox,
  piggyBank: PictogramPiggyBank,
  processing: PictogramProcessing,
  baloons: PictogramBaloons,
  places: PictogramPlaces,
  notAvailable: PictogramNotAvailable,
  airship: PictogramAirship,
  search: PictogramSearch,
  unrecognized: PictogramUnrecognized,
  error: PictogramError,
  umbrella: PictogramUmbrella,
  inProgress: PictogramInProgress,
  fireworks: PictogramFireworks,
  puzzle: PictogramPuzzle,
  question: PictogramQuestion,
  pin: PictogramPin,
  timeout: PictogramTimeout,
  uploadFile: PictogramUploadFile,
  hourglass: PictogramHourglass,
  teaBreak: PictogramTeaBreak,
  sms: PictogramSms,
  condom: PictogramCondom,
  heart: PictogramHeart,
  completed: PictogramCompleted
};

export type IOPictogramType = keyof typeof IOPictograms;

type IOPictogramsProps = {
  name: IOPictogramType;
  color?: IOColorType;
  size?: number | "100%";
};

export type SVGPictogramProps = {
  size: number | "100%";
  color: ColorValue;
};

const Pictogram = ({
  name,
  color = "aqua",
  size = 120,
  ...props
}: IOPictogramsProps) => {
  const PictogramElement = IOPictograms[name];
  return <PictogramElement {...props} size={size} color={IOColors[color]} />;
};

export default Pictogram;
