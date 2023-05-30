import React from "react";
import { ColorValue } from "react-native";
import { IOColors } from "../variables/IOColors";

import PictogramAirBaloon from "./svg/PictogramAirBaloon";
import PictogramHeart from "./svg/PictogramHeart";
import PictogramCompleted from "./svg/PictogramCompleted";
import PictogramEmailValidation from "./svg/PictogramEmailValidation";
import PictogramEmailToValidate from "./svg/PictogramEmailToValidate";
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
import PictogramInbox from "./svg/PictogramInbox";
import PictogramBeerMug from "./svg/PictogramBeerMug";
import PictogramIBANCard from "./svg/IBANCard";
import PictogramFollowMessage from "./svg/PictogramFollowMessage";
import PictogramManual from "./svg/PictogramManual";
import PictogramSetup from "./svg/PictogramSetup";
import PictogramAttention from "./svg/PictogramAttention";
import PictogramEmptyArchive from "./svg/PictogramEmptyArchive";
import PictogramUmbrellaNew from "./svg/PictogramUmbrellaNew";

export const IOPictograms = {
  airBaloon: PictogramAirBaloon,
  abacus: PictogramAbacus,
  emailValidation: PictogramEmailValidation /* io-email-validated */,
  emailToValidate: PictogramEmailToValidate /* io-email-to-validate */,
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
  fireworks: PictogramFireworks /* io-fireworks */,
  puzzle: PictogramPuzzle,
  question: PictogramQuestion,
  pin: PictogramPin,
  timeout: PictogramTimeout,
  uploadFile: PictogramUploadFile,
  hourglass: PictogramHourglass,
  teaBreak: PictogramTeaBreak,
  beerMug: PictogramBeerMug,
  sms: PictogramSms,
  heart: PictogramHeart /* io-heart */,
  completed: PictogramCompleted,
  ibanCard: PictogramIBANCard,
  followMessage: PictogramFollowMessage,
  manual: PictogramManual,
  setup: PictogramSetup,
  attention: PictogramAttention,
  emptyArchive: PictogramEmptyArchive,
  umbrellaNew: PictogramUmbrellaNew
};

export type IOPictograms = keyof typeof IOPictograms;

type IOPictogramsProps = {
  name: IOPictograms;
  color?: IOColors;
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
