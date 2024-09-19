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
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";

export type WizardScreenProps = {
  title: string;
  description?: string;
  pictogram: IOPictograms;
  actions: IOScrollViewActions;
};

/**
 * A common screen used in a wizard flow to show a pictogram, a title, a description and one or two buttons.
 */
export const WizardScreen = ({
  title,
  description,
  pictogram,
  actions
}: WizardScreenProps) => {
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
