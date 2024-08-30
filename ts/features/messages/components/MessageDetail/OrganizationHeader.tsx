import React, { useCallback } from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import {
  Avatar,
  IOSpacingScale,
  IOStyles,
  LabelSmall,
  LabelSmallAlt
} from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import { messagePaymentDataSelector } from "../../store/reducers/detailsById";
import { UIMessageId } from "../../types";
import { DoubleAvatar } from "../Home/DS/DoubleAvatar";

export type OrganizationHeaderProps = {
  messageId: UIMessageId;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
  logoUri?: ReadonlyArray<ImageURISource>;
};

const ITEM_PADDING_VERTICAL: IOSpacingScale = 6;
const AVATAR_MARGIN_LEFT: IOSpacingScale = 16;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ITEM_PADDING_VERTICAL
  },
  itemAvatar: {
    marginLeft: AVATAR_MARGIN_LEFT
  }
});

export const OrganizationHeader = ({
  messageId,
  logoUri,
  serviceId,
  organizationName,
  serviceName
}: OrganizationHeaderProps) => {
  const navigation = useIONavigation();
  const paymentData = useIOSelector(state =>
    messagePaymentDataSelector(state, messageId)
  );
  const navigateToServiceDetails = useCallback(
    () =>
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId
        }
      }),
    [navigation, serviceId]
  );
  return (
    <View style={styles.item}>
      <View style={IOStyles.flex}>
        <LabelSmallAlt color="grey-700">{organizationName}</LabelSmallAlt>
        <LabelSmall color="blueIO-500" onPress={navigateToServiceDetails}>
          {serviceName}
        </LabelSmall>
      </View>
      <View style={styles.itemAvatar}>
        {paymentData ? (
          <DoubleAvatar backgroundLogoUri={logoUri} />
        ) : (
          <Avatar logoUri={logoUri} size="small" />
        )}
      </View>
    </View>
  );
};
