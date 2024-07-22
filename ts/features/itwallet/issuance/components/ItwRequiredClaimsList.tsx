import {
  Divider,
  H6,
  Icon,
  IOColors,
  LabelSmall
} from "@pagopa/io-app-design-system";
import {
  DateFromString,
  DateFromTimestamp
} from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { localeDateFormat } from "../../../../utils/locale";
import {
  ClaimDisplayFormat,
  ClaimValue,
  DateClaim,
  DrivingPrivilegesClaim,
  EvidenceClaim,
  ImageClaim,
  PlaceOfBirthClaim,
  PlainTextClaim
} from "../../common/utils/itwClaimsUtils";

export type RequiredClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<RequiredClaim>;
};

const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.map(a => a),
      RA.mapWithIndex((index, { claim, source }) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <H6>{getClaimDisplayValue(claim)}</H6>
              <LabelSmall weight="Regular" color="grey-700">
                {I18n.t("features.itWallet.generic.dataSource.single", {
                  credentialSource: source
                })}
              </LabelSmall>
            </View>
            <Icon name="checkTickBig" size={24} color="grey-300" />
          </View>
        </View>
      ))
    )}
  </View>
);

export const getClaimDisplayValue = (claim: ClaimDisplayFormat): string =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => I18n.t("features.itWallet.generic.placeholders.claimNotAvailable"),
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return `${decoded.locality} (${decoded.country})`;
        } else if (DateClaim.is(decoded)) {
          return localeDateFormat(
            decoded,
            I18n.t("global.dateFormats.shortFormat")
          );
        } else if (EvidenceClaim.is(decoded)) {
          return decoded[0].record.source.organization_name;
        } else if (ImageClaim.is(decoded)) {
          return decoded;
        } else if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.vehicle_category_code;
        } else if (PlainTextClaim.is(decoded)) {
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

export { ItwRequiredClaimsList as ItwRequestedClaimsList };
