import {
  Avatar,
  BodySmall,
  H2,
  HSpacer,
  IOColors,
  IOSkeleton,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";

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
import { BonusCardShape } from "./BonusCardShape";
import { BonusCardStatus } from "./BonusCardStatus";

type BaseProps = {
  // For devices with small screens you may need to hide the logo to get more space
  hideLogo?: boolean;
  isCGNType?: ReactNode;
};

type ContentProps = {
  logoUris?: Array<ImageURISource | number>;
  name: string;
  organizationName: string;
  status: ReactNode;
  counters?: ReadonlyArray<BonusCardCounter>;
  cardFooter?: ReactNode;
  cardBackground?: ReactNode;
};

type LoadingStateProps =
  | { isLoading: true }
  | ({ isLoading?: never } & ContentProps);

export type BonusCard = LoadingStateProps & BaseProps;

const BonusCardContent = (props: BonusCard) => {
  const bonusNameHeadingRef = createRef<View>();

  useLayoutEffect(() => {
    setAccessibilityFocus(bonusNameHeadingRef);
  }, [bonusNameHeadingRef]);

  const { themeType } = useIOThemeContext();
  const isDark = themeType === "dark";

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
    isCGNType
  } = props;

  const idPayColors = isDark ? "blueIO-50" : "blueItalia-850";

  return (
    <View style={styles.content} testID="BonusCardContentTestID">
      {!hideLogo && (
        <>
          <View style={styles.logos}>
            {logoUris?.map((logoUri, index) => (
              <Avatar key={index} size="medium" logoUri={logoUri} />
            ))}
          </View>
          <VSpacer size={16} />
        </>
      )}
      <H2
        ref={bonusNameHeadingRef}
        role="heading"
        color={!isCGNType ? idPayColors : "blueItalia-850"}
        style={{ textAlign: "center" }}
      >
        {name}
      </H2>
      <VSpacer size={4} />
      <BodySmall
        weight="Regular"
        color={!isCGNType ? idPayColors : "blueItalia-850"}
        style={{ textAlign: "center", marginHorizontal: 16 }}
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

export const BonusCard = (props: BonusCard) => {
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

  return (
    <View style={[styles.container, { paddingTop }]}>
      {!props.isLoading && props.cardBackground ? (
        <>
          <View style={{ ...StyleSheet.absoluteFillObject }}>
            {props.cardBackground}
          </View>
          <BonusCardShape key={shapeKey} mode="draw-on-top" />
        </>
      ) : (
        <BonusCardShape key={shapeKey} mode="mask" />
      )}
      <BonusCardContent {...props} />
    </View>
  );
};

const BonusCardSkeleton = (props: BaseProps) => {
  const placeholderColor = IOColors["blueItalia-100"];

  return (
    <View style={styles.content} testID="BonusCardSkeletonTestID">
      {!props.hideLogo && (
        <>
          <IOSkeleton
            color={placeholderColor}
            shape="square"
            size={66}
            radius={8}
          />
          <VSpacer size={24} />
        </>
      )}
      <IOSkeleton
        color={placeholderColor}
        shape="rectangle"
        height={28}
        width={198}
        radius={28}
      />
      <VSpacer size={8} />
      <IOSkeleton
        color={placeholderColor}
        shape="rectangle"
        height={28}
        width={108}
        radius={28}
      />
      <VSpacer size={16} />
      <BonusCardStatus isLoading={true} />
      <VSpacer size={16} />
      <View style={styles.counters}>
        <BonusCardCounter type="ValueWithProgress" isLoading={true} />
        <HSpacer size={16} />
        <BonusCardCounter type="Value" isLoading={true} />
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
