import {
  HeaderSecondLevel,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useState, useLayoutEffect, memo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useMaxBrightness } from "../../../../../utils/brightness.ts";
import {
  ItwSkeumorphicCard,
  SKEUMORPHIC_CARD_ASPECT_RATIO
} from "../../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../../common/components/ItwSkeumorphicCard/FlipGestureDetector.tsx";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils.ts";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { ItwPresentationCredentialCardFlipButton } from "../components/ItwPresentationCredentialCardFlipButton.tsx";
import { trackCredentialCardModal } from "../analytics";
import { getMixPanelCredential } from "../../../analytics/utils/analyticsUtils.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { itwIsClaimValueHiddenSelector } from "../../../common/store/selectors/preferences.ts";
import { itwSetClaimValuesHidden } from "../../../common/store/actions/preferences.ts";
import { ItwPresentationCredentialCardHideValuesButton } from "../components/ItwPresentationCredentialCardHideValuesButton.tsx";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

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
  const [isFlipped, setFlipped] = useState(false);
  const theme = useIOTheme();
  const valuesHidden = useIOSelector(itwIsClaimValueHiddenSelector);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const dispatch = useIODispatch();

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  useFocusEffect(
    useCallback(() => {
      trackCredentialCardModal(
        getMixPanelCredential(credential.credentialType, isItwL3)
      );
    }, [credential.credentialType, isItwL3])
  );

  useLayoutEffect(() => {
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

  const handleClaimVisibility = useCallback(() => {
    dispatch(itwSetClaimValuesHidden(!valuesHidden));
  }, [valuesHidden, dispatch]);

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
            valuesHidden={valuesHidden}
          />
        </FlipGestureDetector>
      </View>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
        fullScreen={true}
      />
      <VSpacer size={12} />
      <ItwPresentationCredentialCardHideValuesButton
        handleOnPress={handleClaimVisibility}
        valuesHidden={valuesHidden}
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

const MemoizedItwPresentationCredentialCardModal = memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
