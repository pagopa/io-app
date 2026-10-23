import {
  Body,
  ContentWrapper,
  ForceScrollDownView,
  IOColorsLegacy,
  IODimensions,
  VStack
} from "@io-app/design-system";
import { View } from "react-native";

const CUSTOM_SLOT_HEIGHT = 150;

export const DSForceScrollDownViewCustomSlot = () => (
  <ForceScrollDownView
    buttonAccessibilityLabel="Scroll to bottom"
    contentContainerStyle={{
      paddingTop: IODimensions.padding.screen.default
    }}
    threshold={CUSTOM_SLOT_HEIGHT}
  >
    <VStack space={24}>
      <ContentWrapper>
        <VStack space={8}>
          {[...Array(5)].map((_el, i) => (
            <Body key={`body-${i}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam nec
              nulla semper, elementum leo nec, euismod ligula. Phasellus varius,
              sem fringilla rutrum rutrum, ante erat convallis dolor, a
              porttitor justo purus a dolor. Mauris ultrices dui magna, et
              efficitur augue sollicitudin a. Curabitur dapibus mollis tempus.
              Quisque lobortis arcu vitae efficitur scelerisque.
            </Body>
          ))}
        </VStack>
      </ContentWrapper>
      <View
        style={{
          height: CUSTOM_SLOT_HEIGHT,
          backgroundColor: IOColorsLegacy["success-100"]
        }}
      />
    </VStack>
  </ForceScrollDownView>
);
