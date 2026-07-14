import { StyleSheet, View } from "react-native";
import { IOColors, IOVisualCostants } from "../../core";
import { IOIcons, Icon } from "./Icon";

type IconContained = {
  variant: "tonal";
  color: "neutral";
  icon: IOIcons;
};

type IconContainedVisualAttrs = {
  background: IOColors;
  foreground: IOColors;
};

type IconContainedColorVariants = Record<
  IconContained["color"],
  IconContainedVisualAttrs
>;

const tonalColorMap: IconContainedColorVariants = {
  neutral: {
    background: "blueIO-50",
    foreground: "grey-450"
  }
};

const variantMap: Record<IconContained["variant"], IconContainedColorVariants> =
  {
    tonal: tonalColorMap
  };

const IconContainedDefaultSize = IOVisualCostants.iconContainedSizeDefault;

const styles = StyleSheet.create({
  iconContainedWrapper: {
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: IconContainedDefaultSize,
    height: IconContainedDefaultSize,
    borderRadius: IconContainedDefaultSize / 2
  }
});

/*
`IconContained` is just a special wrapper for the `Icon` component. 
It's also not an interactive component, unlike the `IconButton`.
When adding new styles, you should be aware of this context and be careful
not to add variants that look like interactive counterparts.
*/
export const IconContained = ({ variant, color, icon }: IconContained) => {
  const backgroundColor = variantMap[variant][color].background;

  const foregroundColor = variantMap[variant][color].foreground;

  return (
    <View
      style={[
        styles.iconContainedWrapper,
        { backgroundColor: IOColors[backgroundColor] }
      ]}
    >
      <Icon name={icon} color={foregroundColor} />
    </View>
  );
};
