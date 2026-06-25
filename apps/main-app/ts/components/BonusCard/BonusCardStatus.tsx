import { IOSkeleton } from "@pagopa/io-app-design-system";
import { ReactNode } from "react";
import { ColorValue, StyleSheet, View } from "react-native";

export type BonusCardStatus = BaseProps | LoadingProps;

type BaseProps = {
  children: ReactNode;
  isLoading?: never;
};

type LoadingProps = {
  isLoading: true;
  skeletonColor: ColorValue;
};

export const BonusCardStatus = (props: BonusCardStatus) =>
  props.isLoading ? (
    <BonusCardStatusSkeleton skeletonColor={props.skeletonColor} />
  ) : (
    <BonusCardStatusContent {...props} />
  );

export const BonusCardStatusContent = ({ children }: BaseProps) => (
  <View style={styles.container} testID="BonusCardStatusTestID">
    {children}
  </View>
);

const BonusCardStatusSkeleton = ({
  skeletonColor
}: Pick<LoadingProps, "skeletonColor">) => (
  <View style={styles.container} testID="BonusCardStatusSkeletonTestID">
    <IOSkeleton
      color={skeletonColor}
      height={16}
      radius={16}
      shape="rectangle"
      width={278}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 30,
    flexDirection: "row",
    alignItems: "center"
  }
});
