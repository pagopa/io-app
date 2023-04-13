import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import { SignatureRequestListView } from "../../../../definitions/fci/SignatureRequestListView";
import { HSpacer } from "../../../components/core/spacer/Spacer";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
import { IOBadge } from "../../../components/core/IOBadge";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import I18n from "../../../i18n";

type Props = {
  item: SignatureRequestListView;
  onPress: () => void;
};

const styles = StyleSheet.create({
  badge: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center"
  }
});

const SignatureRequestItem = (props: Props) => {
  const { item, onPress } = props;
  const renderStatusLabel = () => {
    switch (item.status) {
      case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
        return (
          <IOBadge
            small
            labelColor={"white"}
            text={I18n.t("features.fci.requests.signingInProgress")}
            testID={"FciSignatureRequestItemBadgeInProgress"}
          />
        );
      case SignatureRequestStatusEnum.SIGNED:
        return (
          <IOBadge
            small
            labelColor={"bluegreyDark"}
            text={I18n.t("features.fci.requests.signed")}
            testID={"FciSignatureRequestItemBadgeSigned"}
          />
        );
      case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      default:
        return (
          <IOBadge
            small
            labelColor={"red"}
            text={I18n.t("features.fci.requests.notAvailable")}
            testID={"FciSignatureRequestItemBadgeNotAvailable"}
          />
        );
    }
  };
  return (
    <View>
      <TouchableDefaultOpacity
        style={{ flexDirection: "row", paddingTop: 16, paddingBottom: 16 }}
        onPress={onPress}
        testID={"FciSignatureRequestOnPress"}
      >
        <View style={{ flexDirection: "column", flex: 1 }}>
          <H4>{item.dossier_title}</H4>
          <LabelSmall weight={"Regular"} color={"bluegrey"} numberOfLines={1}>
            {I18n.t("features.fci.requests.itemSubtitle", {
              date: item.created_at.toLocaleDateString(),
              time: item.created_at.toLocaleTimeString(),
              id: item.id
            })}
          </LabelSmall>
        </View>
        <HSpacer />
        <View style={styles.badge}>{renderStatusLabel()}</View>
      </TouchableDefaultOpacity>
      <ItemSeparatorComponent noPadded={true} />
    </View>
  );
};

export default SignatureRequestItem;
