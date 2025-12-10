import I18n from "i18next";
import { Fragment } from "react";
import { IOListViewWithLargeHeader } from "../../../../components/ui/IOListViewWithLargeHeader";

export function FavouriteServicesScreen() {
  return (
    <IOListViewWithLargeHeader
      title={{
        label: I18n.t("services.favouriteServices.title")
      }}
      keyExtractor={() => "empty"}
      data={[]}
      renderItem={() => <Fragment />}
    />
  );
}
