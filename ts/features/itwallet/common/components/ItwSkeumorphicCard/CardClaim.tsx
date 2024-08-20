import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import { constNull, pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
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

export type AbsoluteClaimPosition = Record<"x" | "y", `${number}%`>;

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
            const formattedDate = localeDateFormat(decoded, "%d/%m/%Y");
            return <ClaimLabel>{formattedDate}</ClaimLabel>;
          } else if (EvidenceClaim.is(decoded)) {
            return <ClaimLabel>{JSON.stringify(decoded)}</ClaimLabel>;
          } else if (ImageClaim.is(decoded)) {
            return (
              <Image
                source={{ uri: decoded }}
                style={{
                  width: "23.6%",
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

/**
 * Component that allows to position a claim using "x" and "y" absolute values
 * This components takes all the available space inside the parent component, then
 * the "x" and "y" values are transformed in a relative position using the "padding".
 */
const CardClaimContainer = ({
  position,
  children
}: React.PropsWithChildren<{
  position: AbsoluteClaimPosition;
}>) => (
  <View
    style={[
      styles.container,
      {
        left: position.x,
        top: position.y
      }
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
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
  MemoizedCardClaim as CardClaim,
  CardClaimContainer,
  MemoizedCardClaimRenderer as CardClaimRenderer
};
