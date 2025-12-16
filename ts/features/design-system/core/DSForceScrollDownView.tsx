import {
  Body,
  ContentWrapper,
  FooterActions,
  ForceScrollDownView,
  IOButton,
  IOVisualCostants,
  VStack
} from "@pagopa/io-app-design-system";
import { ComponentProps, useState } from "react";
import { Alert } from "react-native";

type FooterActionsProps = ComponentProps<typeof FooterActions>;

export const DSForceScrollDownView = () => {
  const defaultFooterActions: FooterActionsProps = {
    actions: {
      type: "SingleButton",
      primary: {
        label: "Continua",
        onPress: () => {
          Alert.alert("Button pressed");
        }
      }
    }
  };

  const [footerActions, setFooterActions] =
    useState<FooterActionsProps>(defaultFooterActions);

  const alternativeFooterActions: FooterActionsProps = {
    actions: {
      type: "TwoButtons",
      primary: {
        label: "Continue",
        onPress: () => {
          Alert.alert("Continue pressed");
        }
      },
      secondary: {
        label: "Cancel",
        onPress: () => {
          Alert.alert("Cancel pressed");
        }
      }
    }
  };

  return (
    <ForceScrollDownView
      footerActions={footerActions}
      contentContainerStyle={{
        paddingTop: IOVisualCostants.appMarginDefault
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <VStack space={8}>
            {[...Array(4)].map((_el, i) => (
              <Body key={`body-${i}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec
                nulla semper, elementum leo nec, euismod ligula. Phasellus
                varius, sem fringilla rutrum rutrum, ante erat convallis dolor,
                a porttitor justo purus a dolor. Mauris ultrices dui magna, et
                efficitur augue sollicitudin a. Curabitur dapibus mollis tempus.
                Quisque lobortis arcu vitae efficitur scelerisque.
              </Body>
            ))}
          </VStack>
          <VStack space={16} style={{ alignItems: "flex-start" }}>
            <IOButton
              variant="outline"
              label="Change button configuration"
              onPress={() => {
                setFooterActions(alternativeFooterActions);
              }}
            />
            <IOButton
              variant="link"
              label="Reset button configuration"
              onPress={() => {
                setFooterActions(defaultFooterActions);
              }}
            />
          </VStack>
          <VStack space={8}>
            {[...Array(2)].map((_el, i) => (
              <Body key={`body-${i}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec
                nulla semper, elementum leo nec, euismod ligula. Phasellus
                varius, sem fringilla rutrum rutrum, ante erat convallis dolor,
                a porttitor justo purus a dolor. Mauris ultrices dui magna, et
                efficitur augue sollicitudin a.
              </Body>
            ))}
          </VStack>
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};
