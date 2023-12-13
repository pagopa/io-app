import { Chip, HSpacer, IOColors, Tag } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import Placeholder from "rn-placeholder";
import I18n from "../../i18n";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { format } from "../../utils/dates";
import { BonusStatus } from "./type";

type LoadingProps = {
  isLoading: true;
};

type BaseProps = {
  isLoading?: never;
  endDate: Date;
  status: BonusStatus;
};

export type BonusCardStatus = LoadingProps | BaseProps;

export const BonusCardStatus = (props: BonusCardStatus) =>
  props.isLoading ? (
    <BonusCardStatusSkeleton />
  ) : (
    <BonusCardStatusContent {...props} />
  );

export const BonusCardStatusContent = ({ status, endDate }: BaseProps) => {
  const validityText = React.useMemo(() => {
    switch (status) {
      case "ACTIVE":
      case "PAUSED":
        return I18n.t("bonusCard.validUntil", {
          endDate: format(endDate, "DD/MM/YY")
        });
      case "EXPIRING":
        return I18n.t("bonusCard.expiring", {
          endDate: format(endDate, "DD MMMM YYYY")
        });
      default:
        return undefined;
    }
  }, [status, endDate]);

  const content = React.useMemo(() => {
    {
      switch (status) {
        case "ACTIVE":
          return <Chip color="grey-650">{validityText}</Chip>;
        case "PAUSED":
          return (
            <>
              <Tag variant="info" text={I18n.t("bonusCard.paused")} />
              <HSpacer size={8} />
              <Chip color="grey-650">{validityText}</Chip>
            </>
          );
        case "EXPIRING":
          return <Tag variant="warning" text={validityText} />;
        case "REMOVED":
          return <Tag variant="error" text={I18n.t("bonusCard.removed")} />;
      }
    }
  }, [status, validityText]);

  return (
    <View style={styles.container} testID="BonusCardStatusTestID">
      {content}
    </View>
  );
};

const BonusCardStatusSkeleton = () => {
  const isDesignSystemEnabled = useSelector(isDesignSystemEnabledSelector);

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
