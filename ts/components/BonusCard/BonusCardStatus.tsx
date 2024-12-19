import { IOColors } from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

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
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  const placeholderColor = isDesignSystemEnabled
    ? IOColors["blueItalia-100"]
    : IOColors["blueIO-100"];

  return (
    <View style={styles.container} testID="BonusCardStatusSkeletonTestID">
      <Placeholder.Box
        height={16}
        width={278}
        color={placeholderColor}
        animate="fade"
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
