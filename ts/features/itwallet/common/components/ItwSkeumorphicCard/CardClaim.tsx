import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import { constNull, pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import React from "react";
import {
  Image,
  LayoutRectangle,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
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

export type AbsoluteClaimPosition = Record<"x" | "y", number>;

/**
 * Transforms relative position values in paddings
 * @param layout the layout rectangle which contains the dimensions of the container
 * @param relativePosition claim position expressed in percentile values
 * @returns a style that describes the position of the claim within the card
 */
const getClaimPosition = (
  layout: LayoutRectangle | undefined,
  { x, y }: AbsoluteClaimPosition
): ViewStyle | undefined =>
  layout && {
    paddingLeft: x * layout.width,
    paddingTop: y * layout.height
  };

export type CardClaimProps = {
  claim: ParsedCredential[number];
  position: AbsoluteClaimPosition;
};

/**
 * Default claim component, it decoded the provided value and renders the corresponging component
 * @returns The corresponding component if a value is correctly decoded, otherwise null
 */
const CardClaim = ({ claim, position }: CardClaimProps) => {
  const claimContent = React.useMemo(
    () =>
      pipe(
        claim.value,
        ClaimValue.decode,
        E.fold(constNull, decoded => {
          if (DateFromString.is(decoded)) {
            const formattedDate = localeDateFormat(decoded, "%d/%m/%y");
            return <ClaimLabel>{formattedDate}</ClaimLabel>;
          } else if (EvidenceClaim.is(decoded)) {
            return <ClaimLabel>{JSON.stringify(decoded)}</ClaimLabel>;
          } else if (ImageClaim.is(decoded)) {
            return (
              <Image
                source={{ uri: decoded }}
                style={{
                  width: "24.5%",
                  aspectRatio: 3 / 4
                }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            );
          } else if (DrivingPrivilegesClaim.is(decoded)) {
            const privileges = decoded.map(p => p.driving_privilege).join(",");
            return <ClaimLabel>{privileges}</ClaimLabel>;
          } else if (PlaceOfBirthClaim.is(decoded)) {
            return <ClaimLabel>{decoded.locality}</ClaimLabel>;
          } else {
            return <ClaimLabel>{decoded}</ClaimLabel>;
          }
        })
      ),
    [claim]
  );

  return (
    <CardClaimContainer position={position}>{claimContent}</CardClaimContainer>
  );
};

export type CardClaimRendererProps<T> = {
  claim: ParsedCredential[number];
  decoder: t.Type<T, string>;
  component: (decoded: T) => React.ReactElement;
};

/**
 * Allows to render a claim if it satisfies the provided decoder
 * @returns The component from the props if value if correctly decoded, otherwise it returns null
 */
const CardClaimRenderer = <T,>({
  claim,
  decoder,
  component
}: CardClaimRendererProps<T>) =>
  pipe(claim.value, decoder.decode, E.fold(constNull, component));

type CardClaimContainer = {
  position: AbsoluteClaimPosition;
};

/**
 * Component that allows to position a claim using "x" and "y" absolute values
 * This components takes all the available space inside the parent component, then
 * the "x" and "y" values are transformed in a relative position using the "padding".
 */
const CardClaimContainer = ({
  position,
  children
}: React.PropsWithChildren<CardClaimContainer>) => {
  const [layout, setLayout] = React.useState<LayoutRectangle>();

  return (
    <View
      style={[styles.data, getClaimPosition(layout, position)]}
      onLayout={event => setLayout(event.nativeEvent.layout)}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  data: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});

const MemoizedCardClaim = React.memo(CardClaim) as typeof CardClaim;

const MemoizedCardClaimRenderer = React.memo(
  CardClaimRenderer
) as typeof CardClaimRenderer;

export {
  CardClaimContainer,
  MemoizedCardClaim as CardClaim,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
