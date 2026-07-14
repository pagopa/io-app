import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import { useIOTheme } from "../../context";
import { IOSelectionListItemVisualParams, IOSpacer } from "../../core";
import { IOButton } from "../buttons";
import { HStack, VStack } from "../layout";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import { PressableModuleBase } from "./PressableModuleBase";

type LoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ImageProps =
  | { paymentLogo: IOLogoPaymentType; image?: never }
  | { paymentLogo?: never; image: ImageURISource | ImageSourcePropType }
  | { paymentLogo?: never; image?: never };

type BaseProps = {
  isLoading?: false;
  paymentLogo?: IOLogoPaymentType;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onPress: () => void;
} & ImageProps;

export type ModuleCheckoutProps = LoadingProps | BaseProps;

const IMAGE_MARGIN: IOSpacer = 12;

const ModuleBaseContent = ({
  paymentLogo,
  image,
  title,
  subtitle
}: Pick<BaseProps, "paymentLogo" | "title" | "subtitle"> &
  Pick<ImageProps, "image">) => {
  const theme = useIOTheme();

  return (
    <HStack
      space={IMAGE_MARGIN}
      style={{ alignItems: "center", flexShrink: 1 }}
    >
      {/* Graphical elements */}
      {paymentLogo ? (
        <LogoPayment name={paymentLogo} />
      ) : (
        image && (
          <Image
            source={image}
            style={styles.image}
            accessibilityIgnoresInvertColors={true}
          />
        )
      )}

      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <H6 color={theme["textBody-default"]}>{title}</H6>
        {subtitle && (
          <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
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
      onPress={onPress}
      accessibilityLabel={
        subtitle ? `${title}, ${subtitle}, ${ctaText}` : `${title}, ${ctaText}`
      }
    >
      <HStack space={4} style={{ alignItems: "center" }}>
        <ModuleBaseContent
          title={title}
          subtitle={subtitle}
          paymentLogo={paymentLogo}
          image={image}
        />
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <IOButton variant="link" label={ctaText} onPress={() => null} />
        </View>
      </HStack>
    </PressableModuleBase>
  ) : (
    <ModuleStatic>
      <ModuleBaseContent
        title={title}
        subtitle={subtitle}
        paymentLogo={paymentLogo}
        image={image}
      />
    </ModuleStatic>
  );
};

const ModuleCheckoutSkeleton = ({
  loadingAccessibilityLabel
}: Pick<LoadingProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessible={true}
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    startBlock={
      <HStack space={8} style={{ alignItems: "center" }}>
        <IOSkeleton shape="square" size={24} radius={8} />
        <VStack space={8}>
          <IOSkeleton shape="rectangle" width={170} height={20} radius={8} />
          <IOSkeleton shape="rectangle" width={110} height={16} radius={8} />
        </VStack>
      </HStack>
    }
    endBlock={
      <IOSkeleton shape="rectangle" width={64} height={16} radius={8} />
    }
  />
);

const styles = StyleSheet.create({
  image: {
    width: IOSelectionListItemVisualParams.iconSize,
    height: IOSelectionListItemVisualParams.iconSize,
    resizeMode: "contain"
  }
});
