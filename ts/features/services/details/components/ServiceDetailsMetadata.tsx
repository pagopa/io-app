import {
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../../definitions/services/ServiceMetadata";
import { useIOSelector } from "../../../../store/hooks";
import { handleItemOnPress } from "../../../../utils/url";
import * as analytics from "../../common/analytics";
import { serviceMetadataByIdSelector } from "../store/selectors";

export type ServiceDetailsMetadataProps = {
  organizationFiscalCode: string;
  serviceId: ServiceId;
};

type MetadataListItem =
  | MetadataListItemAction
  | MetadataListItemInfo
  | MetadataListItemInfoCopy;

type MetadataListItemAction = MetadataListItemBase &
  Omit<ListItemAction, "variant"> & {
    kind: "ListItemAction";
  };

type MetadataListItemBase = {
  condition?: boolean;
};

type MetadataListItemInfo = ListItemInfo &
  MetadataListItemBase & {
    kind: "ListItemInfo";
    label: string;
  };

type MetadataListItemInfoCopy = ListItemInfoCopy &
  MetadataListItemBase & {
    kind: "ListItemInfoCopy";
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

  const handleOpenUrl = useCallback(
    (link: keyof ServiceMetadata, value: string) => {
      analytics.trackServiceDetailsUserExit({
        link,
        service_id: serviceId
      });

      handleItemOnPress(value)();
    },
    [serviceId]
  );

  const metadataListItems: ReadonlyArray<MetadataListItem> = [
    {
      kind: "ListItemAction",
      accessibilityLabel: I18n.t("services.details.metadata.a11y.website"),
      condition: !!web_url,
      icon: "website",
      label: I18n.t("services.details.metadata.website"),
      onPress: () => handleOpenUrl("web_url", `${web_url}`),
      testID: "service-details-metadata-web-url"
    },
    {
      kind: "ListItemAction",
      condition: Platform.OS === "android" && !!app_android,
      icon: "device",
      label: I18n.t("services.details.metadata.downloadApp"),
      onPress: () => handleOpenUrl("app_android", `${app_android}`),
      testID: "service-details-metadata-app-android"
    },
    {
      kind: "ListItemAction",
      condition: Platform.OS === "ios" && !!app_ios,
      icon: "device",
      label: I18n.t("services.details.metadata.downloadApp"),
      onPress: () => handleOpenUrl("app_ios", `${app_ios}`),
      testID: "service-details-metadata-app-ios"
    },
    {
      kind: "ListItemAction",
      condition: !!support_url,
      icon: "chat",
      label: I18n.t("services.details.metadata.support"),
      onPress: () => handleOpenUrl("support_url", `${support_url}`),
      testID: "service-details-metadata-support-url"
    },
    {
      kind: "ListItemAction",
      condition: !!phone,
      icon: "phone",
      label: I18n.t("services.details.metadata.phone"),
      onPress: () => handleOpenUrl("phone", `tel:${phone}`),
      testID: "service-details-metadata-phone"
    },
    {
      kind: "ListItemAction",
      condition: !!email,
      icon: "email",
      label: I18n.t("services.details.metadata.email"),
      onPress: () => handleOpenUrl("email", `mailto:${email}`),
      testID: "service-details-metadata-email"
    },
    {
      kind: "ListItemAction",
      condition: !!pec,
      icon: "pec",
      label: I18n.t("services.details.metadata.pec"),
      onPress: () => handleOpenUrl("pec", `mailto:${pec}`),
      testID: "service-details-metadata-pec"
    },
    {
      kind: "ListItemInfoCopy",
      accessibilityHint: I18n.t(
        "services.details.metadata.a11y.copyToClipboard"
      ),
      icon: "entityCode",
      label: I18n.t("services.details.metadata.fiscalCode"),
      onPress: handleItemOnPress(organizationFiscalCode, "COPY"),
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
      kind: "ListItemInfoCopy",
      accessibilityHint: I18n.t(
        "services.details.metadata.a11y.copyToClipboard"
      ),
      icon: "pinOff",
      label: I18n.t("services.details.metadata.serviceId"),
      onPress: handleItemOnPress(serviceId, "COPY"),
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
          return <ListItemAction variant="primary" {...rest} />;
        case "ListItemInfo":
          return <ListItemInfo {...rest} />;
        case "ListItemInfoCopy":
          return <ListItemInfoCopy {...rest} />;
        default:
          return null;
      }
    },
    []
  );

  const ListHeaderComponent = useMemo(
    () => (
      <ListItemHeader
        label={I18n.t("services.details.metadata.title")}
        testID="service-details-metadata-header"
      />
    ),
    []
  );

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={filteredMetadataListItems}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={item => item.label}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
