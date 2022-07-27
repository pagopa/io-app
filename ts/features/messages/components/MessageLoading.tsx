import I18n from "i18n-js";
import * as React from "react";
import { ActivityIndicator } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { IOColors } from "../../../components/core/variables/IOColors";
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
