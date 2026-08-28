import { WithTestID } from "@io-app/design-system";
import { memo, ReactElement, ReactNode, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { Either, Prettify } from "../../../../../types/helpers";
import {
  ClaimValueKind,
  ClaimValueOfKind,
  parseClaimValue,
  SimpleDateFormat
} from "../../utils/itwClaimsUtils";
import { ParsedCredential } from "../../utils/itwTypesUtils";
import { ClaimImage } from "./ClaimImage";
import { ClaimLabel, ClaimLabelProps } from "./ClaimLabel";

/**
 * Fallback used when a claim cannot be parsed: nothing is rendered on the card.
 */
const renderNothing = () => null;

export type CardClaimProps = Prettify<
  ClaimLabelProps & {
    // A claim that will be used to render its component
    // Since we are passing this value by accessing the claims object by key, the value could be undefined
    claim?: ParsedCredential[number];
    // Optional format for dates contained in the claim component
    dateFormat?: SimpleDateFormat;
    // Claim dimensions
    dimensions?: ClaimDimensions;
    // Absolute position expressed in percentages from top-left corner
    position?: ClaimPosition;
  }
>;

export type ClaimDimensions = Prettify<
  Partial<Record<"height" | "width", PercentPosition>> &
    Pick<ViewStyle, "aspectRatio">
>;

export type ClaimPosition = HorizontalClaimPosition & VerticalClaimPosition;

export type PercentPosition = `${number}%`;

// Defines the claim horizontal position using the left OR the right absolute position value
type HorizontalClaimPosition = Either<
  { left: PercentPosition },
  { right: PercentPosition }
>;

// Defines the claim vertical position using the top OR the bottom absolute position value
type VerticalClaimPosition = Either<
  { top: PercentPosition },
  { bottom: PercentPosition }
>;

/**
 * Default claim component, it decoded the provided value and renders the corresponding component
 * @returns The corresponding component if a value is correctly decoded, otherwise null
 */
const CardClaim = ({
  claim,
  position,
  dimensions,
  testID,
  dateFormat = "DD/MM/YY",
  ...labelProps
}: WithTestID<CardClaimProps>) => {
  const claimContent = useMemo(
    () =>
      parseClaimValue(claim?.value).match(parsed => {
        switch (parsed.kind) {
          case "bool":
          case "emptyString":
          case "fiscalCode":
          case "pdf":
          case "string":
          case "url":
            return <ClaimLabel {...labelProps}>{parsed.value}</ClaimLabel>;
          case "date":
            return (
              <ClaimLabel {...labelProps}>
                {parsed.value.toString(dateFormat)}
              </ClaimLabel>
            );
          case "drivingPrivileges":
            return (
              <ClaimLabel {...labelProps}>
                {parsed.value.map(p => p.driving_privilege).join(" ")}
              </ClaimLabel>
            );
          case "image":
            return (
              <ClaimImage
                base64={parsed.value}
                blur={labelProps.hidden ? 7 : 0}
              />
            );
          case "list":
            return <ClaimLabel {...labelProps}>{parsed.value}</ClaimLabel>;
          // Nested claims are not rendered directly on the card
          case "nestedArray":
          case "nestedObject":
            return null;
          case "placeOfBirth":
            return (
              <ClaimLabel {...labelProps}>{parsed.value.locality}</ClaimLabel>
            );
        }
      }, renderNothing),
    [claim, labelProps, dateFormat]
  );

  if (!claimContent) {
    return null;
  }

  return (
    <CardClaimContainer
      dimensions={dimensions}
      position={position}
      testID={testID}
    >
      {claimContent}
    </CardClaimContainer>
  );
};

export type CardClaimRendererProps<K extends ClaimValueKind> = {
  // A claim that will be used to render a component
  // Since we are passing this value by accessing the claims object by key, the value could be undefined
  claim?: ParsedCredential[number];
  // Function that renders a component with the parsed claim value
  component: (
    value: ClaimValueOfKind<K>
  ) => Iterable<ReactElement> | ReactElement;
  // The claim kinds this renderer can display
  kinds: ReadonlyArray<K>;
};

/**
 * Allows to render a claim only when its parsed value is one of the accepted `kinds`
 * @returns The component from the props if the value is correctly parsed, otherwise it returns null
 */
const CardClaimRenderer = <K extends ClaimValueKind>({
  claim,
  kinds,
  component
}: CardClaimRendererProps<K>) =>
  parseClaimValue(claim?.value).match(
    parsed =>
      (kinds as ReadonlyArray<ClaimValueKind>).includes(parsed.kind)
        ? component(parsed.value as ClaimValueOfKind<K>)
        : null,
    renderNothing
  );

export type CardClaimContainerProps = WithTestID<{
  children?: ReactNode;
  dimensions?: ClaimDimensions;
  position?: ClaimPosition;
}>;

/**
 * Component that allows to position a claim using "left" and "top" absolute values
 */
const CardClaimContainer = ({
  position,
  dimensions,
  children,
  testID
}: CardClaimContainerProps) => (
  <View style={[styles.container, position, dimensions]} testID={testID}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute"
  }
});

const MemoizedCardClaim = memo(CardClaim) as typeof CardClaim;

const MemoizedCardClaimRenderer = memo(
  CardClaimRenderer
) as typeof CardClaimRenderer;

export {
  MemoizedCardClaim as CardClaim,
  CardClaimContainer,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
