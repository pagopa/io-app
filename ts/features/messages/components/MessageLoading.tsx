import React from "react";
import { ActivityIndicator } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { Body } from "../../../components/core/typography/Body";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";

const indicator = (
  <ActivityIndicator
    color={IOColors.blue}
    size={"large"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

export const MessageLoading = (): React.ReactElement => (
  <InfoScreenComponent
    image={indicator}
    title={I18n.t("features.messages.loading.title")}
    body={<Body>{I18n.t("features.messages.loading.subtitle")}</Body>}
  />
);
