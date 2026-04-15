import { IOSkeleton } from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { ColorValue, StyleSheet, View } from "react-native";

type LoadingProps = {
  isLoading: true;
  skeletonColor: ColorValue;
};

type BaseProps = {
  isLoading?: never;
  children: ReactNode;
};

export type BonusCardStatus = LoadingProps | BaseProps;

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
      shape="rectangle"
      height={16}
      width={278}
      radius={16}
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
