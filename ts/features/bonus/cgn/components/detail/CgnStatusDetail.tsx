import * as React from "react";
import { StyleSheet } from "react-native";
import { Badge, Text, View } from "native-base";
import { CgnStatus } from "../../../../../../definitions/cgn/CgnStatus";
import I18n from "../../../../../i18n";
import { H4 } from "../../../../../components/core/typography/H4";
import variables from "../../../../../theme/variables";
import { H5 } from "../../../../../components/core/typography/H5";
import TypedI18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";

type Props = {
  cgnDetail: CgnStatus;
};

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusBadgeActive: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.contentPrimaryBackground
  },
  statusBadgeRevoked: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.brandHighLighter
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
          <Badge style={styles.statusBadgeActive}>
            <Text style={styles.statusText} semibold={true}>
              {I18n.t("bonus.cgn.detail.status.badge.active")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("bonus.cgn.detail.activationDateLabel")}
              </H5>,
              <H5 weight={"Regular"} color={"bluegrey"}>
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
          <Badge style={styles.statusBadgeRevoked}>
            <Text style={styles.statusText} semibold={true}>
              {I18n.t("bonus.cgn.detail.status.badge.expired")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("bonus.cgn.detail.activationDateLabel")}
              </H5>,
              <H5 weight={"Regular"} color={"bluegrey"}>
                {localeDateFormat(
                  // FIXME Replace when types have been updated
                  new Date(),
                  TypedI18n.t("global.dateFormats.shortFormat")
                )}
              </H5>
            )}
            {renderRowBlock(
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("bonus.cgn.detail.expirationDateLabel")}
              </H5>,
              <H5 weight={"Regular"} color={"bluegrey"}>
                {localeDateFormat(
                  // FIXME Replace when types have been updated
                  new Date(),
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
          <Badge style={styles.statusBadgeRevoked}>
            <Text style={styles.statusText} semibold={true}>
              {I18n.t("bonus.cgn.detail.status.badge.revoked")}
            </Text>
          </Badge>
        ),
        dateInformation: (
          <>
            {renderRowBlock(
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("bonus.cgn.detail.activationDateLabel")}
              </H5>,
              <H5 weight={"Regular"} color={"bluegrey"}>
                {localeDateFormat(
                  // FIXME Replace when types have been updated
                  new Date(),
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
