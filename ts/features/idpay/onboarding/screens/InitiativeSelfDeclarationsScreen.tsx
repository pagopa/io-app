import { useActor } from "@xstate/react";
import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import I18n from "i18n-js";
import { ScrollView } from "react-native-gesture-handler";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnboardingMachineService } from "../xstate/provider";
import { Body } from "../../../../components/core/typography/Body";
import { Link } from "../../../../components/core/typography/Link";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ListItemComponent from "../../../../components/screens/ListItemComponent";

export type InitiativeSelfDeclarationsScreenRouteParams = {
  serviceId: string;
};

const InitiativeSelfDeclarationsScreen = () => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);

  const isLoading = state.tags.has("LOADING_TAG");

  return (
    <BaseScreenComponent
      headerTitle="Adesione all'iniziativa"
      goBack={true}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <SafeAreaView style={[IOStyles.flex]}>
          <ScrollView style={IOStyles.flex}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1>Per aderire, dichiari di:</H1>
              <View spacer={true} />
              <Body>L’autodichiarazione è resa ai sensi del</Body>
              <Link>Dpr 28 dicembre 2000 n. 445 art 46 e 47</Link>
              <View spacer={true} large={true} />
              <ListItemComponent
                title="Criterio 1"
                switchValue={false}
                accessibilityRole={"switch"}
                accessibilityState={{ checked: false }}
                isLongPressEnabled={true}
              />
              <ListItemComponent
                title="Criterio 2"
                switchValue={false}
                accessibilityRole={"switch"}
                accessibilityState={{ checked: false }}
                isLongPressEnabled={true}
              />
              <ListItemComponent
                title="Criterio 3"
                switchValue={false}
                accessibilityRole={"switch"}
                accessibilityState={{ checked: false }}
                isLongPressEnabled={true}
              />
            </View>
          </ScrollView>
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            leftButton={{
              bordered: true,
              title: "Indietro"
            }}
            rightButton={{
              title: "Continua"
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export default InitiativeSelfDeclarationsScreen;
