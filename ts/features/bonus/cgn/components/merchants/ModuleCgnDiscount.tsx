import {
  Badge,
  H6,
  HStack,
  IOModuleStyles,
  Icon,
  Tag,
  VStack,
  useIOTheme,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import I18n from "i18next";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategory } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { useCgnStyle } from "../../hooks/useCgnStyle";
import { getCategorySpecs } from "../../utils/filters";
import {
  isValidDiscount,
  moduleCGNaccessibilityLabel,
  normalizedDiscountPercentage
} from "./utils";

export type ModuleCgnDiscount = {
  onPress: () => void;
  discount: Discount;
};

type CategoryTagProps = {
  category: ProductCategory;
};

export const CategoryTag = ({ category }: CategoryTagProps) => {
  const categorySpecs = getCategorySpecs(category);

  return O.isSome(categorySpecs) ? (
    <Tag
      text={I18n.t(categorySpecs.value.nameKey as any)}
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
  const { module: moduleStyle } = useCgnStyle();

  const accessibilityLabel = moduleCGNaccessibilityLabel(discount);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole="button"
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          { borderWidth: 1 },
          IOModuleStyles.button,
          discount.isNew ? moduleStyle.new : moduleStyle.default,
          scaleAnimatedStyle
        ]}
      >
        <View
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row"
          }}
        >
          <VStack space={8} style={{ flexShrink: 1 }}>
            {(discount.discount || discount.isNew) && (
              <HStack space={8} style={{ flexWrap: "wrap" }}>
                {discount.isNew && (
                  <Badge
                    accessible={false}
                    variant="cgn"
                    text={I18n.t("bonus.cgn.merchantsList.news")}
                  />
                )}
                {isValidDiscount(discount.discount) && (
                  <Badge
                    accessible={false}
                    variant="cgn"
                    outline
                    text={`-${normalizedDiscountPercentage(
                      discount.discount
                    )}%`}
                  />
                )}
              </HStack>
            )}

            <H6 color={theme["textHeading-secondary"]}>{discount.name}</H6>
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
