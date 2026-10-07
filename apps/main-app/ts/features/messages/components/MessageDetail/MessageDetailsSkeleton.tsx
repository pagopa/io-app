import {
  ContentWrapper,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";

const SKELETON_RADIUS = 4;
const SUBJECT_LINE_HEIGHT = 28;
const DATE_LINE_HEIGHT = 16;
const SENDER_LINE_COUNT = 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  sender: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  }
});

export const MessageDetailsSkeleton = () => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: IOColors[theme["appBackground-primary"]] }
      ]}
      testID="message-details-skeleton"
    >
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <ScrollView>
          <ContentWrapper>
            <View
              accessibilityHint={I18n.t("messageDetails.pleaseWait")}
              accessibilityLabel={I18n.t("messageDetails.loadingText")}
              accessible={true}
            >
              <View
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
              >
                <VStack space={16}>
                  <VStack space={8}>
                    <IOSkeleton
                      height={SUBJECT_LINE_HEIGHT}
                      radius={SKELETON_RADIUS}
                      shape="rectangle"
                      width="100%"
                    />
                    <IOSkeleton
                      height={SUBJECT_LINE_HEIGHT}
                      radius={SKELETON_RADIUS}
                      shape="rectangle"
                      width="80%"
                    />
                    <IOSkeleton
                      height={DATE_LINE_HEIGHT}
                      radius={SKELETON_RADIUS}
                      shape="rectangle"
                      width="35%"
                    />
                  </VStack>
                  <View style={styles.sender}>
                    <View style={styles.container}>
                      <LoadingSkeleton lines={SENDER_LINE_COUNT} />
                    </View>
                    <IOSkeleton
                      radius={IOVisualCostants.avatarRadiusSizeSmall}
                      shape="square"
                      size={IOVisualCostants.avatarSizeSmall}
                    />
                  </View>
                  <LoadingSkeleton />
                </VStack>
              </View>
            </View>
          </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
