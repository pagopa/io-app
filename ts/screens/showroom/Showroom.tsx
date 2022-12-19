import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { View as NBView } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { ColorsShowroom } from "./core/ColorsShowroom";
import { IllustrationsShowroom } from "./core/IllustrationsShowroom";
import { PictogramsShowroom } from "./core/PictogramsShowroom";
import { IconsShowroom } from "./core/IconsShowroom";
import { LogosShowroom } from "./core/LogosShowroom";
import { SelectionShowroom } from "./core/SelectionShowroom";
import { TypographyShowroom } from "./core/TypographyShowRoom";
import { OthersShowroom } from "./OthersShowroom";
import { ButtonsShowroom } from "./ButtonsShowroom";
import { ToastNotificationsShowroom } from "./core/ToastNotificationsShowroom";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "flex-start"
  }
});

export const Showroom = () => {
  const ref = React.createRef<View>();

  const currentView = ref.current;

  useEffect(() => {
    if (currentView !== null) {
      // eslint-disable-next-line
      // RTron.log(JSON.stringify(ref.current.props.style));
    }
  }, [currentView]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.showroom")}
    >
      <SafeAreaView style={styles.body}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <ColorsShowroom />
            <NBView spacer={true} large={true} />
            <TypographyShowroom />
            <NBView spacer={true} large={true} />
            <SelectionShowroom />
            <NBView spacer={true} large={true} />
            <OthersShowroom />
            <NBView spacer={true} large={true} />
            <ButtonsShowroom />
            <NBView spacer={true} large={true} />
            <ToastNotificationsShowroom />
            <NBView spacer={true} large={true} />
            <PictogramsShowroom />
            <NBView spacer={true} large={true} />
            <IconsShowroom />
            <NBView spacer={true} large={true} />
            <LogosShowroom />
            <NBView spacer={true} large={true} />
            <IllustrationsShowroom />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
