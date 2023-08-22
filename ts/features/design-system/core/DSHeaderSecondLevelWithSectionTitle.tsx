import * as React from "react";
import { useState } from "react";
import { Alert, View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Body } from "../../../components/core/typography/Body";
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import { NewH3 } from "../../../components/core/typography/NewH3";
import HeaderSecondLevel from "../../../components/ui/HeaderSecondLevel";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import IconButton from "../../../components/ui/IconButton";
import { makeFontStyleObject } from "../../../components/core/fonts";
import { IOColors } from "../../../components/core/variables/IOColors";

const styles = StyleSheet.create({
  sectionTitle: {
    ...makeFontStyleObject("Regular", false, "ReadexPro"),
    fontSize: 14,
    lineHeight: 18,
    color: IOColors["grey-700"]
  }
});

export const DSHeaderSecondLevelWithSectionTitle = () => {
  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          scrollValues={{
            contentOffsetY: translationY,
            triggerOffset: titleHeight
          }}
          title={"Seleziona un argomento"}
          firstAction={
            <IconButton
              icon="help"
              color="neutral"
              onPress={() => {
                Alert.alert("Contextual Help");
              }}
              accessibilityLabel={""}
            />
          }
        />
      )
    });
  }, [navigation, titleHeight, translationY]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View onLayout={getTitleHeight}>
        <VSpacer size={8} />
        <Text style={styles.sectionTitle}>Apri una richiesta</Text>
        <NewH3>Seleziona un argomento</NewH3>
      </View>
      <VSpacer size={8} />
      <Body>
        Aiutaci a capire meglio come possiamo aiutarti selezionando l’argomento
        del tuo problema: ti risponderemo il prima possibile, in orario
        lavorativo.
      </Body>
      <VSpacer />
      {[...Array(40)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
    </Animated.ScrollView>
  );
};
