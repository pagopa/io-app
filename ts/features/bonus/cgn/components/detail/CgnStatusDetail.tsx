import { Badge } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "../../../../../../definitions/cgn/Card";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";

type Props = {
  cgnDetail: Card;
};

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusBadgeActive: {
    height: 20,
    marginTop: 2,
    backgroundColor: IOColors.aqua
  },
  statusBadgeRevoked: {
    height: 20,
    marginTop: 2,
    backgroundColor: IOColors.bluegrey
  },
  statusText: { paddingHorizontal: 8 }
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
    <VSpacer size={16} />
  </>
);

const elementsFromStatus = ({ cgnDetail }: Props): StatusElements => {
  switch (cgnDetail.status) {
    case "ACTIVATED":
      return {
        badge: (
          <Badge style={styles.statusBadgeActive} testID={"status-badge"}>
            <H5
              color={"bluegreyDark"}
              style={styles.statusText}
              weight={"SemiBold"}
            >
              {I18n.t("bonus.cgn.detail.status.badge.active")}
            </H5>
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
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  I18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
            {renderRowBlock(
              <H5
                weight={"Regular"}
                color={"bluegrey"}
                testID={"expiration-date-label"}
              >
                {I18n.t("bonus.cgn.detail.status.expiration.cgn")}
              </H5>,
              <H5
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"expiration-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.expiration_date,
                  I18n.t("global.dateFormats.shortFormat")
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
            <H5 color={"white"} style={styles.statusText} weight={"SemiBold"}>
              {I18n.t("bonus.cgn.detail.status.badge.expired")}
            </H5>
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
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  I18n.t("global.dateFormats.shortFormat")
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
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"expiration-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.expiration_date,
                  I18n.t("global.dateFormats.shortFormat")
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
            <H5
              color={"white"}
              weight={"SemiBold"}
              style={{ paddingHorizontal: 8 }}
            >
              {I18n.t("bonus.cgn.detail.status.badge.revoked")}
            </H5>
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
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"activation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.activation_date,
                  I18n.t("global.dateFormats.shortFormat")
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
                weight={"SemiBold"}
                color={"bluegrey"}
                testID={"revocation-date-value"}
              >
                {localeDateFormat(
                  cgnDetail.revocation_date,
                  I18n.t("global.dateFormats.shortFormat")
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
      <View style={styles.rowBlock}>
        <H4>{I18n.t("bonus.cgn.detail.status.title")}</H4>
        {badge}
      </View>
      <VSpacer size={16} />
      {dateInformation}
    </>
  );
};

export default CgnStatusDetail;
