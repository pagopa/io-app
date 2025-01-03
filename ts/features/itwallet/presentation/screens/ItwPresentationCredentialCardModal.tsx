import {
  HeaderSecondLevel,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import {
  ItwSkeumorphicCard,
  SKEUMORPHIC_CARD_ASPECT_RATIO
} from "../../common/components/ItwSkeumorphicCard";
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
  const safeAreaInsets = useSafeAreaInsets();
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
        {
          paddingBottom: safeAreaInsets.bottom,
          backgroundColor: theme["appBackground-primary"]
        }
      ]}
    >
      <View
        style={[
          styles.cardContainer,
          {
            top: -safeAreaInsets.top
          }
        ]}
      >
        <FlipGestureDetector
          isFlipped={isFlipped}
          setIsFlipped={setFlipped}
          direction={"updown"}
        >
          <ItwSkeumorphicCard
            credential={credential}
            status={status}
            isFlipped={isFlipped}
          />
        </FlipGestureDetector>
      </View>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
      />
      <VSpacer size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end"
  },
  cardContainer: {
    transform: [
      { rotate: "90deg" }, // Rotates the card to landscape
      { scale: SKEUMORPHIC_CARD_ASPECT_RATIO } // Scales the card to fit the screen
    ],
    position: "absolute",
    paddingHorizontal: 24,
    justifyContent: "center",
    bottom: IOVisualCostants.headerHeight,
    left: 0,
    right: 0
  }
});

const MemoizedItwPresentationCredentialCardModal = React.memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
