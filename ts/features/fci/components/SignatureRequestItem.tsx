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
        return <IOBadge small labelColor={"white"} text={"Firma in corso"} />;
      case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
        return <IOBadge small labelColor={"red"} text={"Non disponibile"} />;
      case SignatureRequestStatusEnum.SIGNED:
        return <IOBadge small labelColor={"bluegreyDark"} text={"Firmato"} />;
      default:
        return <IOBadge small labelColor={"red"} text={"Non disponibile"} />;
    }
  };
  return (
    <View>
      <TouchableDefaultOpacity
        style={{ flexDirection: "row", paddingTop: 16, paddingBottom: 16 }}
        onPress={onPress}
      >
        <View style={{ flexDirection: "column", flex: 1 }}>
          <H4>{item.dossier_title}</H4>
          <LabelSmall weight={"Regular"} color={"bluegrey"} numberOfLines={1}>
            {`${item.created_at.toLocaleDateString()}${item.id}`}
          </LabelSmall>
        </View>
        <HSpacer />
        <View style={styles.badge}>{renderStatusLabel()}</View>
      </TouchableDefaultOpacity>
      <ItemSeparatorComponent />
    </View>
  );
};

export default SignatureRequestItem;
