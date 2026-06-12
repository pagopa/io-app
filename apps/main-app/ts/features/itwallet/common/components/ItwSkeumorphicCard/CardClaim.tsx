import { WithTestID } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";

import { memo, ReactElement, ReactNode, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Either, Prettify } from "../../../../../types/helpers";
import {
  ClaimValue,
  DrivingPrivilegesClaim,
  DrivingPrivilegesCustomClaim,
  ImageClaim,
  NestedClaim,
  PlaceOfBirthClaim,
  SimpleDateClaim,
  SimpleDateFormat
} from "../../utils/itwClaimsUtils";
import { ParsedCredential } from "../../utils/itwTypesUtils";
import { ClaimLabel, ClaimLabelProps } from "./ClaimLabel";
import { ClaimImage } from "./ClaimImage";

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

export type ClaimPosition = HorizontalClaimPosition & VerticalClaimPosition;

export type ClaimDimensions = Prettify<
  Partial<Record<"width" | "height", PercentPosition>> &
    Pick<ViewStyle, "aspectRatio">
>;

export type CardClaimProps = Prettify<
  {
    // A claim that will be used to render its component
    // Since we are passing this value by accessing the claims object by key, the value could be undefined
    claim?: ParsedCredential[number];
    // Absolute position expressed in percentages from top-left corner
    position?: ClaimPosition;
    // Claim dimensions
    dimensions?: ClaimDimensions;
    // Optional format for dates contained in the claim component
    dateFormat?: SimpleDateFormat;
  } & ClaimLabelProps
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
      pipe(
        claim?.value,
        ClaimValue.decode,
        E.fold(constNull, decoded => {
          if (NestedClaim.is(decoded)) {
            // If the claim is a NestedArrayClaim or NestedObjectClaim, we don't render it directly
            // but we return null to skip rendering
            return null;
          }

          if (SimpleDateClaim.is(decoded)) {
            const formattedDate = decoded.toString(dateFormat);
            return <ClaimLabel {...labelProps}>{formattedDate}</ClaimLabel>;
          } else if (ImageClaim.is(decoded)) {
            return (
              <ClaimImage base64={decoded} blur={labelProps.hidden ? 7 : 0} />
            );
          } else if (
            DrivingPrivilegesClaim.is(decoded) ||
            DrivingPrivilegesCustomClaim.is(decoded)
          ) {
            const privileges = decoded.map(p => p.driving_privilege).join(" ");
            return <ClaimLabel {...labelProps}>{privileges}</ClaimLabel>;
          } else if (PlaceOfBirthClaim.is(decoded)) {
            return <ClaimLabel {...labelProps}>{decoded.locality}</ClaimLabel>;
          } else {
            return <ClaimLabel {...labelProps}>{decoded}</ClaimLabel>;
          }
        })
      ),
    [claim, labelProps, dateFormat]
  );

  if (!claimContent) {
    return null;
  }

  return (
    <CardClaimContainer
      testID={testID}
      position={position}
      dimensions={dimensions}
    >
      {claimContent}
    </CardClaimContainer>
  );
};

export type CardClaimRendererProps<T> = {
  // A claim that will be used to render a component
  // Since we are passing this value by accessing the claims object by key, the value could be undefined
  claim?: ParsedCredential[number];
  // Function that check that the proviced claim is of the correct type
  is: (value: unknown) => value is T;
  // Function that renders a component with the decoded provided claim
  component: (decoded: T) => ReactElement | Iterable<ReactElement>;
};

/**
 * Allows to render a claim if it satisfies the provided `is` function
 * @returns The component from the props if value if correctly decoded, otherwise it returns null
 */
const CardClaimRenderer = <T,>({
  claim,
  is,
  component
}: CardClaimRendererProps<T>) =>
  pipe(
    claim?.value,
    ClaimValue.decode,
    O.fromEither,
    O.filter(is),
    O.fold(constNull, component)
  );

// O.filter(is), O.fold(constNull, component)

export type CardClaimContainerProps = WithTestID<{
  position?: ClaimPosition;
  dimensions?: ClaimDimensions;
  children?: ReactNode;
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
  <View testID={testID} style={[styles.container, position, dimensions]}>
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
