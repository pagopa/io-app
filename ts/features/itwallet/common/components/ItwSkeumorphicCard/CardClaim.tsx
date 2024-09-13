import { WithTestID } from "@pagopa/io-app-design-system";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import { Either, Prettify } from "../../../../../types/helpers";
import { localeDateFormat } from "../../../../../utils/locale";
import {
  ClaimValue,
  DrivingPrivilegesClaim,
  EvidenceClaim,
  ImageClaim,
  PlaceOfBirthClaim
} from "../../utils/itwClaimsUtils";
import { ParsedCredential } from "../../utils/itwTypesUtils";
import { ClaimLabel } from "./ClaimLabel";

type PercentPosition = `${number}%`;

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

export type CardClaimProps = WithTestID<{
  // A claim that will be used to render its component
  claim?: ParsedCredential[number];
  // Absolute position expressed in percentages from top-left corner
  position?: ClaimPosition;
  // Claim dimensions
  dimensions?: ClaimDimensions;
}>;

/**
 * Default claim component, it decoded the provided value and renders the corresponging component
 * @returns The corresponding component if a value is correctly decoded, otherwise null
 */
const CardClaim = ({ claim, position, dimensions, testID }: CardClaimProps) => {
  const claimContent = React.useMemo(
    () =>
      pipe(
        claim?.value,
        ClaimValue.decode,
        E.fold(constNull, decoded => {
          if (DateFromString.is(decoded)) {
            const formattedDate = localeDateFormat(decoded, "%d/%m/%Y");
            return <ClaimLabel>{formattedDate}</ClaimLabel>;
          } else if (EvidenceClaim.is(decoded)) {
            return <ClaimLabel>{JSON.stringify(decoded)}</ClaimLabel>;
          } else if (ImageClaim.is(decoded)) {
            return (
              <Image
                source={{ uri: decoded }}
                resizeMode="contain"
                style={{
                  width: "100%",
                  height: "100%"
                }}
                accessibilityIgnoresInvertColors
              />
            );
          } else if (DrivingPrivilegesClaim.is(decoded)) {
            const privileges = decoded.map(p => p.driving_privilege).join(", ");
            return <ClaimLabel>{privileges}</ClaimLabel>;
          } else if (PlaceOfBirthClaim.is(decoded)) {
            return <ClaimLabel>{decoded.locality}</ClaimLabel>;
          } else {
            return <ClaimLabel>{decoded.toString().toUpperCase()}</ClaimLabel>;
          }
        })
      ),
    [claim]
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
  claim?: ParsedCredential[number];
  // Function that check that the proviced claim is of the correct type
  is: (value: unknown) => value is T;
  // Function that renders a component with the decoded provided claim
  component: (decoded: T) => React.ReactElement | Iterable<React.ReactElement>;
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
  children?: React.ReactNode;
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

const MemoizedCardClaim = React.memo(CardClaim) as typeof CardClaim;

const MemoizedCardClaimRenderer = React.memo(
  CardClaimRenderer
) as typeof CardClaimRenderer;

export {
  MemoizedCardClaim as CardClaim,
  CardClaimContainer,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
