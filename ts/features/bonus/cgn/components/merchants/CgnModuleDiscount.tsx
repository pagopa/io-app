import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
  Badge,
  H6,
  HSpacer,
  IOColors,
  IOModuleStyles,
  IOScaleValues,
  IOSpringValues,
  IOStyles,
  Icon,
  Tag,
  VSpacer,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { pipe } from "fp-ts/lib/function";
import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import I18n from "../../../../../i18n";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { getCategorySpecs } from "../../utils/filters";

type Props = {
  onPress: () => void;
  merchantName: string;
  discount: Discount;
  merchantType?: DiscountCodeType;
};

const styles = StyleSheet.create({
  bacgroundDefault: {
    backgroundColor: IOColors["grey-50"]
  },
  backgroundNewItem: {
    backgroundColor: IOColors["hanPurple-250"]
  }
});
type CategoryTagProps = {
  category: ProductCategory;
};

const CategoryTag = ({ category }: CategoryTagProps) => {
  const categorySpecs = getCategorySpecs(category);

  return O.isSome(categorySpecs) ? (
    <>
      <View>
        <Tag text={I18n.t(categorySpecs.value.nameKey)} variant="noIcon" />
        <VSpacer size={4} />
      </View>
      <HSpacer size={4} />
    </>
  ) : null;
};
export const CgnModuleDiscount = ({
  onPress,
  merchantName,
  discount,
  merchantType
}: Props) => {
  const { isExperimental } = useIOExperimentalDesign();
  const isPressed = useSharedValue(0);
  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  const scaleTraversed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleTraversed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const handlePressIn = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const handlePressOut = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);
  const normalizedValue = pipe(
    WithinRangeInteger(0, 100).decode(discount.discount),
    E.map(v => v.toString()),
    E.getOrElse(() => "-")
  );

  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onTouchEnd={handlePressOut}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          IOModuleStyles.button,
          discount.isNew ? styles.backgroundNewItem : styles.bacgroundDefault,
          animatedStyle
        ]}
      >
        <View
          style={[
            { flexGrow: 1 },
            IOStyles.row,
            { alignItems: "center", justifyContent: "space-between" }
          ]}
        >
          <View>
            <View style={[IOStyles.flex, IOStyles.row]}>
              {discount.isNew && (
                <>
                  <Badge
                    variant="purple"
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                  />
                  <HSpacer size={8} />
                </>
              )}
              {discount.discount && (
                <Badge variant="purple" outline text={`-${normalizedValue}%`} />
              )}
            </View>
            <VSpacer size={8} />
            <H6>{discount.name}</H6>
            <VSpacer size={8} />
            <View style={[{ flexWrap: "wrap" }, IOStyles.row]}>
              {discount.productCategories.map(categoryKey => (
                <CategoryTag key={categoryKey} category={categoryKey} />
              ))}
            </View>
          </View>
          <View style={IOStyles.flex}>
            <Icon
              name="chevronRightListItem"
              color={isExperimental ? "blueIO-500" : "blue"}
              size={24}
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};
