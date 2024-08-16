import {
  IOFontFamily,
  useIOExperimentalDesign,
  useTypographyFactory
} from "@pagopa/io-app-design-system";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/lib/Either";
import { constNull, pipe } from "fp-ts/lib/function";
import React from "react";
import {
  Image,
  LayoutRectangle,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import I18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import {
  ClaimValue,
  DrivingPrivilegesClaim,
  EvidenceClaim,
  ImageClaim,
  PlaceOfBirthClaim,
  StringClaim
} from "../../utils/itwClaimsUtils";
import { ParsedCredential } from "../../utils/itwTypesUtils";

export type RelativeClaimPosition = Record<"x" | "y", number>;

export type CardClaimProps = {
  claim: ParsedCredential[number];
  position: RelativeClaimPosition;
};

const CardClaim = ({ claim, position }: CardClaimProps) => {
  const [layout, setLayout] = React.useState<LayoutRectangle>();

  const claimContent = React.useMemo(
    () =>
      pipe(
        claim.value,
        ClaimValue.decode,
        E.fold(constNull, decoded => {
          if (DateFromString.is(decoded)) {
            const formattedDate = localeDateFormat(
              decoded,
              I18n.t("global.dateFormats.shortFormat")
            );
            return <ClaimLabel>{formattedDate}</ClaimLabel>;
          } else if (EvidenceClaim.is(decoded)) {
            return <ClaimLabel>{JSON.stringify(decoded)}</ClaimLabel>;
          } else if (ImageClaim.is(decoded)) {
            return (
              <Image
                source={{ uri: decoded }}
                style={{
                  width: 90,
                  aspectRatio: 3 / 4
                }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            );
          } else if (DrivingPrivilegesClaim.is(decoded)) {
            const privileges = decoded.map(p => p.driving_privilege).join(",");
            return <ClaimLabel>{privileges}</ClaimLabel>;
          } else if (StringClaim.is(decoded)) {
            return <ClaimLabel>{decoded}</ClaimLabel>; // must be the last one to be checked due to overlap with IPatternStringTag
          } else if (PlaceOfBirthClaim.is(decoded)) {
            return <ClaimLabel>{decoded.locality}</ClaimLabel>; // must be the last one to be checked due to overlap with IPatternStringTag
          } else {
            return <ClaimLabel>{decoded}</ClaimLabel>;
          }
        })
      ),
    [claim]
  );

  return (
    <View
      style={[styles.data, getClaimPosition(layout, position)]}
      onLayout={event => setLayout(event.nativeEvent.layout)}
    >
      {claimContent}
    </View>
  );
};

/**
 * Transforms relative position values in paddings
 * @param layout the layout rectangle which contains the dimensions of the container
 * @param relativePosition claim position expressed in percentile
 * @returns a style that describes the position of the claim within the card
 */
const getClaimPosition = (
  layout: LayoutRectangle | undefined,
  relativePosition: RelativeClaimPosition
): ViewStyle | undefined =>
  layout && {
    paddingLeft: relativePosition.x * layout.width,
    paddingTop: relativePosition.y * layout.height
  };

type ClaimLabelProps = Omit<React.ComponentPropsWithRef<typeof Text>, "style">;

const ClaimLabel: React.FunctionComponent<ClaimLabelProps> = props => {
  const fontName: IOFontFamily = "ReadexPro";
  const legacyFontName: IOFontFamily = "TitilliumSansPro";

  const { isExperimental } = useIOExperimentalDesign();
  return useTypographyFactory({
    ...props,
    defaultWeight: "Semibold",
    defaultColor: "black",
    font: "TitilliumSansPro",
    fontStyle: { fontSize: 12 },
    lineBreakMode: "head",
    numberOfLines: 1
  });
};

const styles = StyleSheet.create({
  data: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});

export default React.memo(CardClaim) as typeof CardClaim;
