import { Badge, Icon } from "@pagopa/io-app-design-system";
import React, { useState } from "react";
import { CredentialCatalogItem } from "../utils/mocks";
import I18n from "../../../i18n";
import ListItemLoadingItw from "./ListItems/ListItemLoadingItw";

type Props = {
  catalogItem: CredentialCatalogItem;
  onPress: () => void;
};

/**
 * Renders a single credential catalog item in a FlatList.
 * @param catalogItem: the catalog item to render.
 */
const ItwCredentialsCatalogItem = ({ catalogItem, onPress }: Props) => {
  const [loading, setIsLoading] = useState(false);

  const onPressHandler = () => {
    setIsLoading(true);
    onPress();
  };

  return (
    <ListItemLoadingItw
      onPress={onPressHandler}
      accessibilityLabel={catalogItem.title}
      title={catalogItem.title}
      icon={catalogItem.icon}
      rightNode={
        catalogItem.incoming ? (
          <Badge
            text={I18n.t(
              "features.itWallet.issuing.credentialsCatalogScreen.incomingFeature"
            )}
            variant="success"
          />
        ) : (
          <Icon name="chevronRight" />
        )
      }
      disabled={catalogItem.incoming}
      loading={loading}
    />
  );
};

export default ItwCredentialsCatalogItem;
