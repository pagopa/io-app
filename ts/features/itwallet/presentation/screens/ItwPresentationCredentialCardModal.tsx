import {
  HeaderSecondLevel,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../common/components/ItwSkeumorphicCard/FlipGestureDetector";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationCredentialCardFlipButton } from "../components/ItwPresentationCredentialCardFlipButton";

export type ItwPresentationCredentialCardModalNavigationParams = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_CARD_MODAL"
>;

/**
 * Dispalys a full screen modal with the credential card.
 */
const ItwPresentationCredentialCardModal = ({ route, navigation }: Props) => {
  const { credential, status } = route.params;
  const [isFlipped, setFlipped] = React.useState(false);
  const theme = useIOTheme();

  useMaxBrightness({ useSmoothTransition: true });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={""}
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  return (
    <View
      style={[
        styles.contentContainer,
        { backgroundColor: theme["appBackground-primary"] }
      ]}
    >
      <View style={styles.cardContainer}>
        <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setFlipped}>
          <ItwSkeumorphicCard
            credential={credential}
            status={status}
            orientation="landscape"
            isFlipped={isFlipped}
          />
        </FlipGestureDetector>
      </View>
      <View style={styles.flipButtonContainer}>
        <ItwPresentationCredentialCardFlipButton
          isFlipped={isFlipped}
          handleOnPress={() => setFlipped(_ => !_)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1
  },
  cardContainer: {
    position: "absolute",
    paddingHorizontal: 24,
    justifyContent: "center",
    left: 0,
    right: 0,
    top: -IOVisualCostants.headerHeight,
    bottom: 0
  },
  flipButtonContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0
  }
});

const MemoizedItwPresentationCredentialCardModal = React.memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
