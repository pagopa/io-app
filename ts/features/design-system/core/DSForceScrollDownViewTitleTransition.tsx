import {
  Body,
  ContentWrapper,
  ForceScrollDownView,
  IOColors,
  IOVisualCostants,
  VStack
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

const CUSTOM_SLOT_HEIGHT = 150;

export const DSForceScrollDownViewTitleTransition = () => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    title: "ForceScrollDownView w/ Title transition",
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef
  });

  return (
    <ForceScrollDownView
      animatedRef={animatedScrollViewRef}
      threshold={CUSTOM_SLOT_HEIGHT}
      contentContainerStyle={{
        paddingTop: IOVisualCostants.appMarginDefault
      }}
    >
      <VStack space={24}>
        <ContentWrapper>
          <VStack space={8}>
            {[...Array(5)].map((_el, i) => (
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
        </ContentWrapper>
        <View
          style={{
            height: CUSTOM_SLOT_HEIGHT,
            backgroundColor: IOColors["success-100"]
          }}
        />
      </VStack>
    </ForceScrollDownView>
  );
};
