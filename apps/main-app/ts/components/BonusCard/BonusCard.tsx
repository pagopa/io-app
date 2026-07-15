import {
  Avatar,
  BodySmall,
  H2,
  HSpacer,
  IOSkeleton,
  VSpacer
} from "@io-app/design-system";
import {
  createRef,
  Fragment,
  ReactNode,
  useLayoutEffect,
  useMemo
} from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { setAccessibilityFocus } from "../../utils/accessibility";
import { BonusCardCounter } from "./BonusCardCounter";
import { BonusCardColorSchemeValues } from "./BonusCardScreenComponent";
import { BonusCardShape } from "./BonusCardShape";
import { BonusCardStatus } from "./BonusCardStatus";

export type BonusCard = BaseProps & LoadingStateProps;

export type BonusCardWithColorSchemeValues = BonusCard & {
  cardColorSchemeValues: BonusCardColorSchemeValues;
};

type BaseProps = {
  // For devices with small screens you may need to hide the logo to get more space
  hideLogo?: boolean;
};

type ContentProps = {
  cardBackground?: ReactNode;
  cardFooter?: ReactNode;
  counters?: ReadonlyArray<BonusCardCounter>;
  logoUris?: Array<ImageURISource | number>;
  name: string;
  organizationName: string;
  status: ReactNode;
};

type LoadingStateProps =
  | (ContentProps & { isLoading?: never })
  | { isLoading: true };

const BonusCardContent = (props: BonusCardWithColorSchemeValues) => {
  const bonusNameHeadingRef = createRef<View>();

  useLayoutEffect(() => {
    setAccessibilityFocus(bonusNameHeadingRef);
  }, [bonusNameHeadingRef]);

  if (props.isLoading) {
    return <BonusCardSkeleton {...props} />;
  }

  const {
    hideLogo,
    logoUris,
    name,
    organizationName,
    status,
    counters,
    cardFooter,
    cardColorSchemeValues
  } = props;

  return (
    <View style={styles.content} testID="BonusCardContentTestID">
      {!hideLogo && (
        <>
          <View style={styles.logos}>
            {logoUris?.map((logoUri, index) => (
              <Avatar key={index} logoUri={logoUri} size="medium" />
            ))}
          </View>
          <VSpacer size={16} />
        </>
      )}
      <H2
        color={cardColorSchemeValues.text}
        ref={bonusNameHeadingRef}
        role="heading"
        style={{ textAlign: "center" }}
      >
        {name}
      </H2>
      <VSpacer size={4} />
      <BodySmall
        color={cardColorSchemeValues.text}
        style={{ textAlign: "center", marginHorizontal: 16 }}
        weight="Regular"
      >
        {organizationName}
      </BodySmall>
      <VSpacer size={16} />
      <BonusCardStatus>{status}</BonusCardStatus>
      <VSpacer size={16} />
      {counters && (
        <View style={styles.counters}>
          {counters.map((counter, index) => {
            const isLast = index === counters.length - 1;
            return (
              <Fragment key={`${counter.label}_${index}`}>
                <BonusCardCounter {...counter} />
                {!isLast && <HSpacer size={16} />}
              </Fragment>
            );
          })}
        </View>
      )}
      {cardFooter}
    </View>
  );
};

export const BonusCard = (props: BonusCardWithColorSchemeValues) => {
  const safeAreaInsets = useSafeAreaInsets();

  // If the logo is hidden, this margin prevents content shift when mutating from a loading state
  const hiddenLogoLoadingMargin = props.hideLogo && props.isLoading ? 8 : 0;
  // This padding is necessary to get enough space on top to display the header
  const paddingTop = safeAreaInsets.top + hiddenLogoLoadingMargin + 64;

  // This will generate a new key based on isLoading state.
  // A new key will force BonusCardShape to rerender, remeasuring the layout and adapting to new
  // container size.
  const shapeKey = useMemo(
    () => props.isLoading && Math.random().toString(36).slice(2),
    [props.isLoading]
  );

  const { cardColorSchemeValues } = props;

  return (
    <View style={[styles.container, { paddingTop }]}>
      {!props.isLoading && props.cardBackground ? (
        <>
          <View style={{ ...StyleSheet.absoluteFillObject }}>
            {props.cardBackground}
          </View>
          <BonusCardShape
            backgroundColor={cardColorSchemeValues.background}
            key={shapeKey}
            mode="draw-on-top"
          />
        </>
      ) : (
        <BonusCardShape
          backgroundColor={cardColorSchemeValues.background}
          key={shapeKey}
          mode="mask"
        />
      )}
      <BonusCardContent {...props} />
    </View>
  );
};

const BonusCardSkeleton = (props: BonusCardWithColorSchemeValues) => {
  const foregroundColor = props.cardColorSchemeValues.foreground;

  return (
    <View style={styles.content} testID="BonusCardSkeletonTestID">
      {!props.hideLogo && (
        <>
          <IOSkeleton
            color={foregroundColor}
            radius={8}
            shape="square"
            size={66}
          />
          <VSpacer size={24} />
        </>
      )}
      <IOSkeleton
        color={foregroundColor}
        height={28}
        radius={28}
        shape="rectangle"
        width={198}
      />
      <VSpacer size={8} />
      <IOSkeleton
        color={foregroundColor}
        height={28}
        radius={28}
        shape="rectangle"
        width={108}
      />
      <VSpacer size={16} />
      <BonusCardStatus isLoading={true} skeletonColor={foregroundColor} />
      <VSpacer size={16} />
      <View style={styles.counters}>
        <BonusCardCounter
          isLoading={true}
          skeletonColor={foregroundColor}
          type="ValueWithProgress"
        />
        <HSpacer size={16} />
        <BonusCardCounter
          isLoading={true}
          skeletonColor={foregroundColor}
          type="Value"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    paddingBottom: 24,
    overflow: "hidden"
  },
  content: {
    alignItems: "center"
  },
  counters: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  logos: {
    flexDirection: "row",
    columnGap: 8
  }
});
