import { useActor, useSelector } from "@xstate/react";
import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
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
import { LOADING_TAG } from "../../../../utils/xstate";
import { boolRequiredCriteriaSelector } from "../xstate/selectors";

const InitiativeSelfDeclarationsScreen = () => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);

  const isLoading = state.tags.has(LOADING_TAG);

  const selfCriteriaBool = useSelector(machine, boolRequiredCriteriaSelector);

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_BOOL_CRITERIA" });
  const goBackOnPress = () => send({ type: "GO_BACK" });

  return (
    <BaseScreenComponent
      headerTitle="Adesione all'iniziativa"
      goBack={goBackOnPress}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={IOStyles.flex}>
            <View style={IOStyles.horizontalContentPadding}>
              <H1>Per aderire, dichiari di:</H1>
              <View spacer={true} />
              <Body>L’autodichiarazione è resa ai sensi del</Body>
              <Link>Dpr 28 dicembre 2000 n. 445 art 46 e 47</Link>
              <View spacer={true} large={true} />
              {selfCriteriaBool.map((criteria, index) => (
                <View key={criteria.code}>
                  <ListItemComponent
                    key={index}
                    title={criteria.description}
                    switchValue={true}
                    accessibilityRole={"switch"}
                    accessibilityState={{ checked: false }}
                    isLongPressEnabled={true}
                  />
                  <View spacer={true} />
                </View>
              ))}
            </View>
          </ScrollView>
          <FooterWithButtons
            type={"TwoButtonsInlineHalf"}
            leftButton={{
              bordered: true,
              title: "Indietro",
              onPress: goBackOnPress
            }}
            rightButton={{
              title: "Continua",
              onPress: continueOnPress
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export default InitiativeSelfDeclarationsScreen;
