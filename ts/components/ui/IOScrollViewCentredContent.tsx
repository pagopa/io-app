import {
  Body,
  H3,
  IOPictograms,
  Pictogram,
  VStack
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { IOScrollView, IOScrollViewActions } from "./IOScrollView";

export type IOScrollViewCentredContent = {
  pictogram: IOPictograms;
  title: string;
  description?: string;
  actions: IOScrollViewActions;
};

/**
 * Istance of `IOScrollView` where the main content is centred and the
 * action(s) is/are placed at the bottom of the page.
 */
export const IOScrollViewCentredContent = ({
  title,
  description,
  pictogram,
  actions
}: IOScrollViewCentredContent) => {
  useHeaderSecondLevel({
    canGoBack: true,
    title: ""
  });

  return (
    <IOScrollView centerContent actions={actions}>
      <VStack space={16} style={{ alignItems: "center" }}>
        <Pictogram name={pictogram} size={180} />
        <View style={{ paddingHorizontal: 24 }}>
          <VStack space={8} style={{ alignItems: "center" }}>
            <H3 style={{ textAlign: "center" }}>{title}</H3>
            {description && (
              <Body weight="Regular" style={{ textAlign: "center" }}>
                {description}
              </Body>
            )}
          </VStack>
        </View>
      </VStack>
    </IOScrollView>
  );
};
