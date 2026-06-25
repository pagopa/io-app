import {
  Badge,
  BodySmall,
  Divider,
  H6,
  HSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { SignatureRequestListView } from "../../../../definitions/fci/SignatureRequestListView";
import { SignatureRequestStatusEnum } from "../../../../definitions/fci/SignatureRequestStatus";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";

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
      case SignatureRequestStatusEnum.SIGNED:
        return (
          <Badge
            testID={"FciSignatureRequestItemBadgeSigned"}
            text={I18n.t("features.fci.requests.signed")}
            variant="highlight"
          />
        );
      case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
        return (
          <Badge
            testID={"FciSignatureRequestItemBadgeInProgress"}
            text={I18n.t("features.fci.requests.signingInProgress")}
            variant="default"
          />
        );
      case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      default:
        return (
          <Badge
            outline
            testID={"FciSignatureRequestItemBadgeNotAvailable"}
            text={I18n.t("features.fci.requests.notAvailable")}
            variant="error"
          />
        );
    }
  };
  return (
    <View>
      <TouchableDefaultOpacity
        onPress={onPress}
        style={{ flexDirection: "row", paddingTop: 16, paddingBottom: 16 }}
        testID={"FciSignatureRequestOnPress"}
      >
        <View style={{ flexDirection: "column", flex: 1 }}>
          <H6>{item.dossier_title}</H6>
          <BodySmall numberOfLines={1} weight={"Regular"}>
            {I18n.t("features.fci.requests.itemSubtitle", {
              date: item.created_at.toLocaleDateString(),
              time: item.created_at.toLocaleTimeString(),
              id: item.id
            })}
          </BodySmall>
        </View>
        <HSpacer />
        <View style={styles.badge}>{renderStatusLabel()}</View>
      </TouchableDefaultOpacity>
      <Divider />
    </View>
  );
};

export default SignatureRequestItem;
