import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import {
  Divider,
  IOVisualCostants,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { FlatList, ListRenderItemInfo, Platform } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import { handleItemOnPress } from "../../../../utils/url";
import * as analytics from "../../common/analytics";
import {
  ServiceContactListItem,
  ServiceContactListItemProps
} from "../../common/components/ServiceContactListItem";
import {
  ServiceContactField,
  serviceContactMap
} from "../../common/utils/serviceContactMap";
import { serviceMetadataByIdSelector } from "../store/selectors";

export type ServiceDetailsMetadataProps = {
  organizationFiscalCode: string;
  serviceId: ServiceId;
};

type MetadataListItem =
  | MetadataListItemAction
  | MetadataListItemInfo
  | MetadataListItemInfoCopy
  | MetadataListItemServiceContact;

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

type MetadataListItemServiceContact = MetadataListItemBase &
  ServiceContactListItemProps & {
    kind: "ServiceContact";
  };

export const ServiceDetailsMetadata = ({
  organizationFiscalCode,
  serviceId
}: ServiceDetailsMetadataProps) => {
  const serviceMetadataById = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const toContactItem = (
    field: ServiceContactField
  ): MetadataListItemServiceContact => ({
    kind: "ServiceContact",
    condition: !!serviceMetadataById?.[field],
    variant: field,
    onPress: value => {
      analytics.trackServiceDetailsUserExit({
        link: field,
        service_id: serviceId
      });
      serviceContactMap[field].openContact(value);
    },
    testID: `service-details-metadata-${field}`,
    value: serviceMetadataById?.[field]
  });

  const contactItems = (
    [
      "web_url",
      Platform.OS === "ios" ? "app_ios" : "app_android",
      "support_url",
      "phone",
      "email",
      "pec"
    ] satisfies ReadonlyArray<ServiceContactField>
  ).map(toContactItem);

  const metadataListItems: ReadonlyArray<MetadataListItem> = [
    ...contactItems,
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
      condition: !!serviceMetadataById?.address,
      icon: "mapPin",
      label: I18n.t("services.details.metadata.address"),
      testID: "service-details-metadata-address",
      value: serviceMetadataById?.address
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
        case "ServiceContact":
          return <ServiceContactListItem {...rest} />;
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
      keyExtractor={item =>
        item.kind === "ServiceContact" ? item.variant : item.label
      }
      ListHeaderComponent={ListHeaderComponent}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
};
