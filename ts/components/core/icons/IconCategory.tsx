import React from "react";
import { IOColors } from "../variables/IOColors";

/* Icons */
import IconCategCulture from "./svg/IconCategCulture";
import IconCategFinance from "./svg/IconCategFinance";
import IconCategHome from "./svg/IconCategHome";
import IconCategJobOffers from "./svg/IconCategJobOffers";
import IconCategLearning from "./svg/IconCategLearning";
import IconCategMobility from "./svg/IconCategMobility";
import IconCategShopping from "./svg/IconCategShopping";
import IconCategSport from "./svg/IconCategSport";
import IconCategSustainability from "./svg/IconCategSustainability";
import IconCategTelco from "./svg/IconCategTelco";
import IconCategTravel from "./svg/IconCategTravel";
import IconCategWellness from "./svg/IconCategWellness";

export const IOCategoryIcons = {
  culture: IconCategCulture,
  wellness: IconCategWellness,
  learning: IconCategLearning,
  sport: IconCategSport,
  home: IconCategHome,
  telco: IconCategTelco,
  finance: IconCategFinance,
  travel: IconCategTravel,
  mobility: IconCategMobility,
  jobOffers: IconCategJobOffers,
  shopping: IconCategShopping,
  sustainability: IconCategSustainability
} as const;

export type IOCategoryIconType = keyof typeof IOCategoryIcons;

type IOCategoryIconsProps = {
  name: IOCategoryIconType;
  color?: IOColors;
  size?: number | "100%";
};

const IconCategory = ({
  name,
  color = "bluegrey",
  size = 56,
  ...props
}: IOCategoryIconsProps) => {
  const IconElement = IOCategoryIcons[name];
  return (
    <IconElement {...props} size={size} style={{ color: IOColors[color] }} />
  );
};

export default IconCategory;
