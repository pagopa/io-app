import {
  Badge,
  H6,
  HSpacer,
  IOColors,
  IOModuleStyles,
  IOStyles,
  Icon,
  Tag,
  VSpacer,
  useIOExperimentalDesign,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import I18n from "../../../../../i18n";
import { getCategorySpecs } from "../../utils/filters";
import { isValidDiscount, normalizedDiscountPercentage } from "./utils";

type Props = {
  onPress: () => void;
  discount: Discount;
};

const styles = StyleSheet.create({
  backgroundDefault: {
    backgroundColor: IOColors["grey-50"],
    borderColor: IOColors["grey-100"]
  },
  backgroundNewItem: {
    backgroundColor: IOColors["hanPurple-50"],
    borderColor: IOColors["hanPurple-250"]
  },
  moduleButton: {
    borderWidth: 1
  }
});
type CategoryTagProps = {
  category: ProductCategory;
};

export const CategoryTag = ({ category }: CategoryTagProps) => {
  const categorySpecs = getCategorySpecs(category);

  return O.isSome(categorySpecs) ? (
    <>
      <View>
        <Tag
          text={I18n.t(categorySpecs.value.nameKey)}
          variant="custom"
          icon={{
            name: categorySpecs.value.icon,
            color: "lightGrey"
          }}
        />
        <VSpacer size={4} />
      </View>
      <HSpacer size={4} />
    </>
  ) : null;
};
export const CgnModuleDiscount = ({ onPress, discount }: Props) => {
  const { isExperimental } = useIOExperimentalDesign();
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");

  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          IOModuleStyles.button,
          styles.moduleButton,
          discount.isNew ? styles.backgroundNewItem : styles.backgroundDefault,
          scaleAnimatedStyle
        ]}
      >
        <View
          style={[
            { flexGrow: 1 },
            IOStyles.row,
            { alignItems: "center", justifyContent: "space-between" }
          ]}
        >
          <View style={IOStyles.flex}>
            <View style={[IOStyles.flex, IOStyles.row]}>
              {discount.isNew && (
                <>
                  <Badge
                    variant="cgn"
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                  />
                  <HSpacer size={8} />
                </>
              )}
              {isValidDiscount(discount.discount) && (
                <Badge
                  variant="cgn"
                  outline
                  text={`-${normalizedDiscountPercentage(discount.discount)}%`}
                />
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
          <Icon
            name="chevronRightListItem"
            color={isExperimental ? "blueIO-500" : "blue"}
            size={24}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};
