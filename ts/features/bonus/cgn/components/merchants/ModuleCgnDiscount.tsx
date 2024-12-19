import {
  Badge,
  H6,
  HStack,
  IOColors,
  IOModuleStyles,
  IOStyles,
  Icon,
  Tag,
  VStack,
  useIOTheme,
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

export type ModuleCgnDiscount = {
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
    <Tag
      text={I18n.t(categorySpecs.value.nameKey)}
      variant="custom"
      icon={{
        name: categorySpecs.value.icon,
        color: "lightGrey"
      }}
    />
  ) : null;
};

export const ModuleCgnDiscount = ({ onPress, discount }: ModuleCgnDiscount) => {
  const theme = useIOTheme();
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
          <VStack space={8} style={{ flexShrink: 1 }}>
            {(discount.discount || discount.isNew) && (
              <HStack space={8} style={{ flexWrap: "wrap" }}>
                {discount.isNew && (
                  <Badge
                    variant="purple"
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                  />
                )}
                {isValidDiscount(discount.discount) && (
                  <Badge
                    variant="purple"
                    outline
                    text={`-${normalizedDiscountPercentage(
                      discount.discount
                    )}%`}
                  />
                )}
              </HStack>
            )}

            <H6>{discount.name}</H6>
            <HStack space={4} style={{ flexWrap: "wrap" }}>
              {discount.productCategories.map(categoryKey => (
                <CategoryTag key={categoryKey} category={categoryKey} />
              ))}
            </HStack>
          </VStack>
          <Icon
            name="chevronRightListItem"
            color={theme["interactiveElem-default"]}
            size={24}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};
