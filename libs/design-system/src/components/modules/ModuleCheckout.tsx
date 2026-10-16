import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";

import { useIOTheme } from "../../context";
import { IODimensions } from "../../core";
import { IOButton } from "../buttons";
import { HStack, VStack } from "../layout";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import { PressableModuleBase } from "./PressableModuleBase";

export type ModuleCheckoutProps = BaseProps | LoadingProps;

type BaseProps = ImageProps & {
  ctaText?: string;
  isLoading?: false;
  onPress: () => void;
  paymentLogo?: IOLogoPaymentType;
  subtitle?: string;
  title: string;
};

type ImageProps =
  | { image: ImageSourcePropType | ImageURISource; paymentLogo?: never }
  | { image?: never; paymentLogo: IOLogoPaymentType }
  | { image?: never; paymentLogo?: never };

type LoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

const ModuleBaseContent = ({
  paymentLogo,
  image,
  title,
  subtitle
}: Pick<BaseProps, "paymentLogo" | "subtitle" | "title"> &
  Pick<ImageProps, "image">) => {
  const theme = useIOTheme();

  return (
    <HStack
      space={IODimensions.gap.module.leading}
      style={{ alignItems: "center", flexShrink: 1 }}
    >
      {/* Graphical elements */}
      {paymentLogo ? (
        <LogoPayment name={paymentLogo} />
      ) : (
        image != null && (
          <Image
            accessibilityIgnoresInvertColors={true}
            source={image}
            style={styles.image}
          />
        )
      )}

      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <H6 color={theme["textBody-default"]}>{title}</H6>
        {subtitle && (
          <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
            {subtitle}
          </BodySmall>
        )}
      </View>
    </HStack>
  );
};

export const ModuleCheckout = (props: ModuleCheckoutProps) => {
  if (props.isLoading) {
    return (
      <ModuleCheckoutSkeleton
        loadingAccessibilityLabel={props.loadingAccessibilityLabel}
      />
    );
  }

  const { paymentLogo, image, title, subtitle, ctaText, onPress } = props;

  return ctaText ? (
    <PressableModuleBase
      accessibilityLabel={
        subtitle ? `${title}, ${subtitle}, ${ctaText}` : `${title}, ${ctaText}`
      }
      onPress={onPress}
    >
      <HStack space={4} style={{ alignItems: "center" }}>
        <ModuleBaseContent
          image={image}
          paymentLogo={paymentLogo}
          subtitle={subtitle}
          title={title}
        />
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <IOButton label={ctaText} onPress={() => null} variant="link" />
        </View>
      </HStack>
    </PressableModuleBase>
  ) : (
    <ModuleStatic>
      <ModuleBaseContent
        image={image}
        paymentLogo={paymentLogo}
        subtitle={subtitle}
        title={title}
      />
    </ModuleStatic>
  );
};

const ModuleCheckoutSkeleton = ({
  loadingAccessibilityLabel
}: Pick<LoadingProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    endBlock={
      <IOSkeleton
        height={16}
        radius={IODimensions.radius.default}
        shape="rectangle"
        width={64}
      />
    }
    startBlock={
      <HStack
        space={IODimensions.gap.module.leading}
        style={{ alignItems: "center" }}
      >
        <IOSkeleton
          radius={IODimensions.radius.default}
          shape="square"
          size={IODimensions.size.icon.module.leading}
        />
        <VStack space={8}>
          <IOSkeleton
            height={20}
            radius={IODimensions.radius.default}
            shape="rectangle"
            width={170}
          />
          <IOSkeleton
            height={16}
            radius={IODimensions.radius.default}
            shape="rectangle"
            width={110}
          />
        </VStack>
      </HStack>
    }
  />
);

const styles = StyleSheet.create({
  image: {
    width: IODimensions.size.icon.module.leading,
    height: IODimensions.size.icon.module.leading,
    resizeMode: "contain"
  }
});
