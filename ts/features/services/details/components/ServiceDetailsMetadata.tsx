import React, { useCallback } from "react";
import { FlatList, Linking, ListRenderItemInfo, Platform } from "react-native";
import {
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceMetadataByIdSelector } from "../store/reducers/servicesById";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { openWebUrl } from "../../../../utils/url";

type MetadataActionListItem = {
  kind: "ListItemAction";
  condition?: boolean;
} & Omit<ListItemAction, "accessibilityLabel" | "variant">;

type MetadataInfoListItem = {
  kind: "ListItemInfo";
  condition?: boolean;
} & Omit<ListItemInfo, "accessibilityLabel">;

type MetadataInfoCopyListItem = {
  kind: "ListItemInfoCopy";
  condition?: boolean;
} & Omit<ListItemInfoCopy, "accessibilityLabel">;

type MetadataListItem =
  | MetadataActionListItem
  | MetadataInfoListItem
  | MetadataInfoCopyListItem;

export type ServiceDetailsMetadataProps = {
  organizationFiscalCode: string;
  serviceId: ServiceId;
};

export const ServiceDetailsMetadata = ({
  organizationFiscalCode,
  serviceId
}: ServiceDetailsMetadataProps) => {
  const serviceMetadataById = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const {
    app_android,
    app_ios,
    address,
    email,
    pec,
    phone,
    support_url,
    web_url
  } = serviceMetadataById || {};

  const metadataListItems: ReadonlyArray<MetadataListItem> = [
    {
      kind: "ListItemAction",
      condition: !!web_url,
      icon: "website",
      label: I18n.t("services.details.metadata.website"),
      onPress: () => openWebUrl(`${web_url}`),
      testID: "service-details-metadata-web-url"
    },
    {
      kind: "ListItemAction",
      condition: Platform.OS === "android" && !!app_android,
      icon: "device",
      label: I18n.t("services.details.metadata.downloadApp"),
      onPress: () => openWebUrl(`${app_android}`),
      testID: "service-details-metadata-app-android"
    },
    {
      kind: "ListItemAction",
      condition: Platform.OS === "ios" && !!app_ios,
      icon: "device",
      label: I18n.t("services.details.metadata.downloadApp"),
      onPress: () => openWebUrl(`${app_ios}`),
      testID: "service-details-metadata-app-ios"
    },
    {
      kind: "ListItemAction",
      condition: !!support_url,
      icon: "chat",
      label: I18n.t("services.details.metadata.support"),
      onPress: () => openWebUrl(`${support_url}`),
      testID: "service-details-metadata-support-url"
    },
    {
      kind: "ListItemAction",
      icon: "phone",
      condition: !!phone,
      label: I18n.t("services.details.metadata.phone"),
      onPress: () => Linking.openURL(`tel:${phone}`),
      testID: "service-details-metadata-phone"
    },
    {
      kind: "ListItemAction",
      condition: !!email,
      icon: "email",
      label: I18n.t("services.details.metadata.email"),
      onPress: () => Linking.openURL(`mailto:${email}`),
      testID: "service-details-metadata-email"
    },
    {
      kind: "ListItemAction",
      condition: !!pec,
      icon: "pec",
      label: I18n.t("services.details.metadata.pec"),
      onPress: () => Linking.openURL(`mailto:${pec}`),
      testID: "service-details-metadata-pec"
    },
    {
      kind: "ListItemInfoCopy",
      label: I18n.t("services.details.metadata.fiscalCode"),
      icon: "entityCode",
      onPress: () => clipboardSetStringWithFeedback(organizationFiscalCode),
      value: organizationFiscalCode,
      testID: "service-details-metadata-org-fiscal-code"
    },
    {
      kind: "ListItemInfo",
      condition: !!address,
      icon: "mapPin",
      label: I18n.t("services.details.metadata.address"),
      testID: "service-details-metadata-address",
      value: address
    },

    {
      kind: "ListItemInfo",
      icon: "pinOff",
      label: I18n.t("services.details.metadata.serviceId"),
      testID: "service-details-metadata-service-id",
      value: serviceId
    }
  ];

  const filteredMetadataListItems = metadataListItems.filter(
    item => item.condition !== false
  );

  const renderItem = useCallback(
    ({
      item: { condition, ...rest }
    }: ListRenderItemInfo<MetadataListItem>) => {
      switch (rest.kind) {
        case "ListItemAction":
          return (
            <ListItemAction
              variant="primary"
              {...rest}
              accessibilityLabel={rest.label}
            />
          );
        case "ListItemInfo":
          return <ListItemInfo {...rest} accessibilityLabel={rest.label} />;
        case "ListItemInfoCopy":
          return <ListItemInfoCopy {...rest} accessibilityLabel={rest.label} />;
        default:
          return null;
      }
    },
    []
  );

  const ListHeaderComponent = (
    <ListItemHeader
      label={I18n.t("services.details.metadata.title")}
      testID="service-details-metadata-header"
    />
  );

  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => <Divider />}
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredMetadataListItems}
      keyExtractor={item => item.label}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
