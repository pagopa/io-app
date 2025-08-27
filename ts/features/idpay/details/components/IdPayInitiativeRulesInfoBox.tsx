import {
  Body,
  H6,
  IOButton,
  IOColors,
  IOSkeleton,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

type Props = {
  content: string;
};

const IdPayInitiativeRulesInfoBox = (props: Props) => {
  const { content } = props;

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: <IOMarkdown content={content} />,
    title: I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title")
  });

  return (
    <>
      <View style={styles.infoBox}>
        <H6>{I18n.t("idpay.initiative.beneficiaryDetails.infobox.title")}</H6>
        <VSpacer size={4} />
        <Body numberOfLines={3} ellipsizeMode="tail">
          {content}
        </Body>
        <VSpacer size={16} />
        <View style={{ flexDirection: "row" }}>
          <IOButton
            iconPosition="end"
            variant="link"
            label={I18n.t(
              "idpay.initiative.beneficiaryDetails.infobox.rulesButton"
            )}
            onPress={present}
            icon="categLearning"
          />
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const IdPayInitiativeRulesInfoBoxSkeleton = () => (
  <View style={styles.infoBox}>
    <IOSkeleton shape="rectangle" width={"40%"} height={24} radius={4} />
    <VSpacer size={16} />
    <VStack space={4}>
      {Array.from({ length: 4 }).map((_, i) => (
        <IOSkeleton
          key={i}
          shape="rectangle"
          height={16}
          width={"100%"}
          radius={4}
        />
      ))}
    </VStack>
  </View>
);

const styles = StyleSheet.create({
  infoBox: {
    borderColor: IOColors["grey-200"],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20
  }
});

export { IdPayInitiativeRulesInfoBox, IdPayInitiativeRulesInfoBoxSkeleton };
