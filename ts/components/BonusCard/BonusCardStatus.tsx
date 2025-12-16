import { IOColors, IOSkeleton } from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type LoadingProps = {
  isLoading: true;
};

type BaseProps = {
  isLoading?: never;
  children: ReactNode;
};

export type BonusCardStatus = LoadingProps | BaseProps;

export const BonusCardStatus = (props: BonusCardStatus) =>
  props.isLoading ? (
    <BonusCardStatusSkeleton />
  ) : (
    <BonusCardStatusContent {...props} />
  );

export const BonusCardStatusContent = ({ children }: BaseProps) => (
  <View style={styles.container} testID="BonusCardStatusTestID">
    {children}
  </View>
);

const BonusCardStatusSkeleton = () => {
  const placeholderColor = IOColors["blueItalia-100"];

  return (
    <View style={styles.container} testID="BonusCardStatusSkeletonTestID">
      <IOSkeleton
        color={placeholderColor}
        shape="rectangle"
        height={16}
        width={278}
        radius={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 30,
    flexDirection: "row",
    alignItems: "center"
  }
});
