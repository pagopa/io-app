import { IODimensions, IOTextColor } from "@io-app/design-system";
import { ColorValue, ViewStyle } from "react-native";

import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { servicesHomeColors } from "../colors";

type ServiceCardStyle = {
  card: ViewStyle;
  foreground: {
    primary: IOTextColor;
    secondary: IOTextColor;
  };
};

type ServiceCardStyleProps = {
  default: ServiceCardStyle;
  new: ServiceCardStyle;
  skeletonColor: ColorValue;
};

/** Returns the common style used for service cards */
export const useServiceCardStyle = (): ServiceCardStyleProps => {
  const { featuredCard } = useFeatureColors(servicesHomeColors);

  return {
    default: {
      card: {
        borderRadius: IODimensions.radius.card,
        borderCurve: "continuous",
        borderWidth: IODimensions.stroke.default,
        borderColor: featuredCard.default.border,
        backgroundColor: featuredCard.default.background
      },
      foreground: {
        primary: featuredCard.default.title,
        secondary: featuredCard.default.subtitle
      }
    },
    new: {
      card: {
        borderColor: featuredCard.new.border,
        backgroundColor: featuredCard.new.background
      },
      foreground: {
        primary: featuredCard.new.title,
        secondary: featuredCard.new.subtitle
      }
    },
    skeletonColor: featuredCard.skeleton
  };
};
