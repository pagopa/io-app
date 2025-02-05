import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import {
  AnimatedCheckbox,
  BodySmall,
  Divider,
  H6,
  IOColors,
  IOSelectionListItemStyles,
  IOStyles,
  Icon,
  useListItemAnimation
} from "@pagopa/io-app-design-system";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import {
  BoolClaim,
  ClaimDisplayFormat,
  ClaimValue,
  DrivingPrivilegesClaim,
  EmptyStringClaim,
  extractFiscalCode,
  FiscalCodeClaim,
  getSafeText,
  ImageClaim,
  PlaceOfBirthClaim,
  SimpleDateClaim,
  StringClaim
} from "../utils/itwClaimsUtils";
import I18n from "../../../../i18n";
import { isStringNullyOrEmpty } from "../../../../utils/strings";

export type ConsentClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<ConsentClaim>;
};

type ItwOptionalClaimsListProps = {
  items: ReadonlyArray<ConsentClaim>;
  selectedClaims: Array<string>;
  onSelectionChange: (claimId: string) => void;
};

type ItwOptionalClaimProps = {
  claim: ClaimDisplayFormat;
  source: string;
  checked: boolean;
  onPress: (claimId: string) => void;
};

/**
 * Claim with a pressable checkbox, customized from `ListItemCheckbox`.
 */
const ItwOptionalClaim = ({
  claim,
  source,
  checked,
  onPress
}: ItwOptionalClaimProps) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const handleOnPress = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    onPress(claim.id);
  };

  return (
    <Pressable
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole="checkbox"
      accessible={true}
      accessibilityLabel={"accessibilityLabel"}
      accessibilityHint={"accessibilityHint"}
      accessibilityState={{ checked }}
    >
      <Animated.View
        style={[IOSelectionListItemStyles.listItem, backgroundAnimatedStyle]}
        // This is required to avoid opacity inheritance on Android
        needsOffscreenAlphaCompositing={true}
      >
        <Animated.View
          style={[scaleAnimatedStyle, IOStyles.row, IOStyles.alignCenter]}
        >
          <View style={{ marginRight: "auto" }}>
            <ClaimText claim={claim} />
            <BodySmall weight="Regular" color="grey-700">
              {I18n.t("features.itWallet.generic.dataSource.single", {
                credentialSource: source
              })}
            </BodySmall>
          </View>
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AnimatedCheckbox checked={checked} size={24} />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

/**
 * List of optional claims that can be disclosed for issuance/presentation.
 * These claims are selectable with a checkbox.
 */
const ItwOptionalClaimsList = ({
  items,
  selectedClaims,
  onSelectionChange
}: ItwOptionalClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.mapWithIndex((index, { claim, source }) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <ItwOptionalClaim
            claim={claim}
            source={source}
            checked={selectedClaims.includes(claim.id)}
            onPress={onSelectionChange}
          />
        </View>
      ))
    )}
  </View>
);

/**
 * List of required claims that must be disclosed for issuance/presentation.
 */
const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.mapWithIndex((index, { claim, source }) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <ClaimText claim={claim} />
              <BodySmall weight="Regular" color="grey-700">
                {I18n.t("features.itWallet.generic.dataSource.single", {
                  credentialSource: source
                })}
              </BodySmall>
            </View>
            <Icon name="checkTickBig" size={24} color="grey-300" />
          </View>
        </View>
      ))
    )}
  </View>
);

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array
 */
const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const displayValue = getClaimDisplayValue(claim);
  return Array.isArray(displayValue) ? (
    displayValue.map((value, index) => {
      const safeValue = getSafeText(value);
      return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
    })
  ) : isStringNullyOrEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
    <H6>{getSafeText(displayValue)}</H6>
  );
};

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => I18n.t("features.itWallet.generic.placeholders.claimNotAvailable"),
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return `${decoded.locality} (${decoded.country})`;
        } else if (SimpleDateClaim.is(decoded)) {
          return decoded.toString();
        } else if (ImageClaim.is(decoded)) {
          return decoded;
        } else if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.map(e => e.driving_privilege);
        } else if (FiscalCodeClaim.is(decoded)) {
          return pipe(
            decoded,
            extractFiscalCode,
            O.getOrElseW(() => decoded)
          );
        } else if (BoolClaim.is(decoded)) {
          return I18n.t(
            `features.itWallet.presentation.credentialDetails.boolClaim.${decoded}`
          );
        } else if (StringClaim.is(decoded) || EmptyStringClaim.is(decoded)) {
          return decoded; // must be the last one to be checked due to overlap with IPatternStringTag
        }

        return I18n.t(
          "features.itWallet.generic.placeholders.claimNotAvailable"
        );
      }
    )
  );

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  dataItem: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export { ItwRequiredClaimsList, ItwOptionalClaimsList };
