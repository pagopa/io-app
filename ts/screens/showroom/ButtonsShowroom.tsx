import { View } from "native-base";
import * as React from "react";
import { ButtonExtendedOutline } from "../../components/ui/ButtonExtendedOutline";
import { ShowroomSection } from "./components/ShowroomSection";

export const ButtonsShowroom = () => (
  <ShowroomSection title={"Buttons"}>
    <View>
      <ButtonExtendedOutline
        label={"Label name"}
        description={"This is a description of the element"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
    <View spacer={true} />
    <View>
      <ButtonExtendedOutline
        icon="arrowRight"
        label={"Label only"}
        onPress={() => {
          alert("Action triggered");
        }}
      />
    </View>
  </ShowroomSection>
);
