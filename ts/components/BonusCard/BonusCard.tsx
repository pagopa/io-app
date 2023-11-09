import {
  Avatar,
  H2,
  HSpacer,
  IOColors,
  Label,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Placeholder from "rn-placeholder";
import { BonusCardShape } from "./BonusCardShape";
import { BonusCounter } from "./BonusCounter";
import { BonusStatusTag } from "./BonusStatusTag";
import { BonusStatus } from "./type";

type BaseProps = {
  // For devices with small screens you may need to hide the logo to get more space
  hideLogo?: boolean;
};

type ContentProps = {
  logoUri?: ImageURISource;
  name: string;
  organizationName: string;
  endDate: Date;
  status: BonusStatus;
  counters: Array<BonusCounter>;
};

type LoadingStateProps =
  | { isLoading: true }
  | ({ isLoading?: never } & ContentProps);

type BonusCardProps = LoadingStateProps & BaseProps;

const BonusCardContent = (props: BonusCardProps) => {
  if (props.isLoading) {
    return <BonusCardSkeleton {...props} />;
  }

  const {
    hideLogo,
    logoUri,
    name,
    organizationName,
    endDate,
    status,
    counters
  } = props;

  return (
    <>
      {!hideLogo && (
        <>
          <Avatar size="medium" shape="square" logoUri={logoUri} />
          <VSpacer size={16} />
        </>
      )}
      <H2 color="blueItalia-850">{name}</H2>
      <VSpacer size={4} />
      <Label weight="Regular" fontSize="small">
        {organizationName}
      </Label>
      <VSpacer size={16} />
      <BonusStatusTag endDate={endDate} status={status} />
      <VSpacer size={16} />
      <View style={styles.counters}>
        {counters.map((counter, index) => {
          const isLast = index === counters.length - 1;
          return (
            <React.Fragment key={`${counter.label}_${index}`}>
              <BonusCounter {...counter} />
              {!isLast && <HSpacer size={16} />}
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

const BonusCard = (props: BonusCardProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  // If the logo is hidden, this margin prevents content shift when mutating from loading state
  const hiddenLogoLoadingMargin = props.hideLogo && props.isLoading ? 8 : 0;
  const paddingTop = safeAreaInsets.top + hiddenLogoLoadingMargin + 64;

  return (
    <View style={[styles.container, { paddingTop }]}>
      <BonusCardShape />
      <View style={styles.content}>
        <BonusCardContent {...props} />
      </View>
    </View>
  );
};

const BonusCardSkeleton = (props: BaseProps) => (
  <>
    {!props.hideLogo && (
      <>
        <Placeholder.Box
          height={66}
          width={66}
          color={IOColors["blueItalia-100"]}
          animate="fade"
          radius={8}
        />
        <VSpacer size={24} />
      </>
    )}
    <Placeholder.Box
      height={28}
      width={198}
      color={IOColors["blueItalia-100"]}
      animate="fade"
      radius={28}
    />
    <VSpacer size={8} />
    <Placeholder.Box
      height={28}
      width={108}
      color={IOColors["blueItalia-100"]}
      animate="fade"
      radius={28}
    />
    <VSpacer size={16} />
    <BonusStatusTag isLoading={true} />
    <VSpacer size={16} />
    <View style={styles.counters}>
      <BonusCounter type="ValueWithProgress" isLoading={true} />
      <HSpacer size={16} />
      <BonusCounter type="Value" isLoading={true} />
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    paddingBottom: 24
  },
  content: {
    alignItems: "center"
  },
  counters: {
    flexDirection: "row",
    justifyContent: "space-around"
  }
});

export { BonusCard };
export type { BonusCardProps };
