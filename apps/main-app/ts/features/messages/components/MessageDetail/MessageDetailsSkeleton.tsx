import {
  ContentWrapper,
  IODimensions,
  IODimensionScale,
  IOSkeleton,
  IOTypography,
  useIOColors,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingSkeleton } from "../../../../components/ui/LoadingSkeleton";

const SKELETON_RADIUS = 4;
const SENDER_PADDING_VERTICAL: IODimensionScale = 6;

const styles = StyleSheet.create({
  container: { flex: 1 },
  senderInfo: { flex: 1 },
  sender: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SENDER_PADDING_VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth
  }
});

export const MessageDetailsSkeleton = () => {
  const colors = useIOColors();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.default }]}
      testID="message-details-skeleton"
    >
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <ScrollView>
          <ContentWrapper>
            <View
              accessibilityHint={I18n.t("messageDetails.pleaseWait")}
              accessibilityLabel={I18n.t("messageDetails.loadingText")}
              accessible={true}
              testID="message-details-skeleton-loading"
            >
              <View
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
              >
                <VStack space={16}>
                  <VStack space={8}>
                    <View />
                    <VStack space={8}>
                      <IOSkeleton
                        height={IOTypography.h3.lineHeight}
                        radius={SKELETON_RADIUS}
                        shape="rectangle"
                        width="100%"
                      />
                      <IOSkeleton
                        height={IOTypography.h3.lineHeight}
                        radius={SKELETON_RADIUS}
                        shape="rectangle"
                        width="80%"
                      />
                      <IOSkeleton
                        height={IOTypography.bodySmall.lineHeight}
                        radius={SKELETON_RADIUS}
                        shape="rectangle"
                        width="35%"
                      />
                    </VStack>
                    <View
                      style={[
                        styles.sender,
                        { borderColor: colors.stroke.divider }
                      ]}
                    >
                      <View style={styles.senderInfo}>
                        <IOSkeleton
                          height={IOTypography.body.lineHeight}
                          radius={SKELETON_RADIUS}
                          shape="rectangle"
                          width="60%"
                        />
                        <IOSkeleton
                          height={IOTypography.bodySmall.lineHeight}
                          radius={SKELETON_RADIUS}
                          shape="rectangle"
                          width="40%"
                        />
                      </View>
                      <IOSkeleton
                        radius={IODimensions.radius.avatar.small}
                        shape="square"
                        size={IODimensions.size.avatar.small}
                      />
                    </View>
                  </VStack>
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
