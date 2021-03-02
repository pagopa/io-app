import * as React from "react";
import { StyleSheet } from "react-native";
import { Badge, Text, View } from "native-base";
import { Card } from "../../../../../../definitions/cgn/Card";
import I18n from "../../../../../i18n";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import TypedI18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import { IOColors } from "../../../../../components/core/variables/IOColors";

type Props = {
  cgnDetail: Card;
};

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusBadgeActive: {
    height: 18,
    marginTop: 2,
    backgroundColor: IOColors.aqua
  },
  statusBadgeRevoked: {
    height: 18,
    marginTop: 2,
    backgroundColor: IOColors.bluegrey
  },
  statusText: {
    fontSize: 12,
    lineHeight: 18
  }
});

type StatusElements = {
  badge: React.ReactNode;
  dateInformation: React.ReactNode;
};

const renderRowBlock = (
  left: React.ReactNode,
  right: React.ReactNode
): React.ReactNode => (
  <>
    <View style={styles.rowBlock}>
      {left}
      {right}
    </View>
    <View spacer />
  </>
);

const elementsFromStatus = ({ cgnDetail }: Props): StatusElements => {
  switch (cgnDetail.status) {
    case "ACTIVATED":
      return {
        badge: (
          <Badge style={styles.statusBadgeActive} testID={"status-badge"}>
            <Text
              style={[styles.statusText, { color: IOColors.bluegreyDark }]}
              semibold={true}
            >
              {I18n.t("bonus.cgn.detail.status.badge.active")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.date.activated")}
              </H5>,
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
          </>
        )
      };
    case "EXPIRED":
      return {
        badge: (
          <Badge style={styles.statusBadgeRevoked} testID={"status-badge"}>
            <Text style={[styles.statusText]} semibold={true} white>
              {I18n.t("bonus.cgn.detail.status.badge.expired")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.date.activated")}
              </H5>,
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"expiration-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.date.expired")}
              </H5>,
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"expiration-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.expiration_date,
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
          </>
        )
      };
    case "REVOKED":
      return {
        badge: (
          <Badge style={styles.statusBadgeRevoked} testID={"status-badge"}>
            <Text style={styles.statusText} semibold={true} white>
              {I18n.t("bonus.cgn.detail.status.badge.revoked")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.date.activated")}
              </H5>,
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"revocation-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.date.revoked")}
              </H5>,
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"revocation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.revocation_date,
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
          </>
        )
      };
    default:
      return {
        badge: <></>,
        dateInformation: <></>
      };
  }
};

const CgnStatusDetail: React.FunctionComponent<Props> = (props: Props) => {
  const { badge, dateInformation } = elementsFromStatus(props);
  return (
    <>
      <View style={[styles.rowBlock]}>
        <H4>{I18n.t("bonus.cgn.detail.status.title")}</H4>
        {badge}
      </View>
      <View spacer />
      {dateInformation}
    </>
  );
};

export default CgnStatusDetail;
