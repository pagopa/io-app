import { View, StyleSheet } from "react-native";
import {
  Badge,
  Divider,
  H6,
  HSpacer,
  BodySmall
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
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
      case SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE:
        return (
          <Badge
            variant="default"
            text={I18n.t("features.fci.requests.signingInProgress")}
            testID={"FciSignatureRequestItemBadgeInProgress"}
          />
        );
      case SignatureRequestStatusEnum.SIGNED:
        return (
          <Badge
            variant="highlight"
            text={I18n.t("features.fci.requests.signed")}
            testID={"FciSignatureRequestItemBadgeSigned"}
          />
        );
      case SignatureRequestStatusEnum.WAIT_FOR_QTSP:
      default:
        return (
          <Badge
            outline
            variant="error"
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
          <H6>{item.dossier_title}</H6>
          <BodySmall weight={"Regular"} numberOfLines={1}>
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
