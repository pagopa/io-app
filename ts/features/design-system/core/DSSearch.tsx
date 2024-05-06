import React from "react";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Body, H2, IOStyles, useIOTheme } from "@pagopa/io-app-design-system";

export const DSSearch = () => {
  const navigation = useNavigation();
  const theme = useIOTheme();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        textColor: theme["textBody-default"],
        barTintColor: theme["appBackground-secondary"],
        tintColor: theme["interactiveElem-default"],
        placeholder: "Cerca tra i tuoi messaggi",
        cancelButtonText: "Annulla",
        hideWhenScrolling: false,
        autoFocus: true
        // onChangeText: (event: NativeSyntheticEvent<TextInputChangeEventData>) =>
        //   console.log(event.nativeEvent.text)
      }
    });
  }, [navigation, theme]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={IOStyles.horizontalContentPadding}
    >
      <H2>Start</H2>
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>{`Repeated text ${i}`}</Body>
      ))}
      <H2>End</H2>
    </ScrollView>
  );
};
