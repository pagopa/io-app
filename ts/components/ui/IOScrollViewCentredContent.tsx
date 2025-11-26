import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  H3,
  IOButton,
  IOPictograms,
  Pictogram,
  VStack
} from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { View } from "react-native";
import {
  IOScrollView,
  IOScrollViewActions,
  IOScrollViewProps
} from "./IOScrollView";

export type IOScrollViewCentredContentProps = {
  actions: IOScrollViewActions;
  pictogram: IOPictograms;
  title: string;
  description?: string | Array<BodyProps>;
  additionalLink?: Pick<
    ComponentProps<typeof IOButton>,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
} & Omit<IOScrollViewProps, "centerContent">;

/**
 * Istance of `IOScrollView` where the main content is centred,
 * and a pictogram->title->description->link layout is provided.
 */
export const IOScrollViewCentredContent = ({
  title,
  description,
  additionalLink,
  pictogram,
  actions,
  children,
  ...scrollViewProps
}: IOScrollViewCentredContentProps) => (
  <IOScrollView centerContent actions={actions} {...scrollViewProps}>
    <VStack space={16} style={{ alignItems: "center" }}>
      <Pictogram name={pictogram} size={180} />
      <View style={{ paddingHorizontal: 24 }}>
        <VStack space={8} style={{ alignItems: "center" }}>
          <H3 accessibilityRole="header" style={{ textAlign: "center" }}>
            {title}
          </H3>
          {description && (
            <>
              {typeof description === "string" ? (
                <Body style={{ textAlign: "center" }}>{description}</Body>
              ) : (
                <ComposedBodyFromArray textAlign="center" body={description} />
              )}
            </>
          )}
        </VStack>
      </View>
      {additionalLink && (
        <View style={{ alignSelf: "center" }}>
          <IOButton variant="link" {...additionalLink} />
        </View>
      )}
    </VStack>
    {children}
  </IOScrollView>
);
