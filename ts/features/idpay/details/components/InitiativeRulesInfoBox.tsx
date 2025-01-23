import {
  Body,
  ButtonSolid,
  ContentWrapper,
  H6,
  HSpacer,
  IOColors,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../../components/IOMarkdown";

type Props = {
  content: string;
};

const InitiativeRulesInfoBox = (props: Props) => {
  const { content } = props;

  const { bottomSheet, present, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      component: <IOMarkdown content={content} />,
      title: I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title"),
      footer: (
        <ContentWrapper>
          <VSpacer size={24} />
          <ButtonSolid
            label={I18n.t(
              "idpay.initiative.beneficiaryDetails.infoModal.button"
            )}
            onPress={() => dismiss()}
            accessibilityLabel={I18n.t(
              "idpay.initiative.beneficiaryDetails.infoModal.button"
            )}
            fullWidth={true}
          />
          <VSpacer size={24} />
        </ContentWrapper>
      )
    },
    170
  );

  return (
    <>
      <View style={styles.infoBox}>
        <H6>{I18n.t("idpay.initiative.beneficiaryDetails.infobox.title")}</H6>
        <VSpacer size={4} />
        <Body numberOfLines={3} ellipsizeMode="tail">
          {content}
        </Body>
        <VSpacer size={16} />
        <View style={IOStyles.row}>
          <Icon name="categLearning" color="blue" />
          <HSpacer size={8} />
          <Body weight="Semibold" asLink onPress={() => present()}>
            {I18n.t("idpay.initiative.beneficiaryDetails.infobox.rulesButton")}
          </Body>
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const InitiativeRulesInfoBoxSkeleton = () => (
  <View style={styles.infoBox}>
    <Placeholder.Box animate="fade" height={24} width={"40%"} radius={4} />
    <VSpacer size={16} />
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={i}>
        <Placeholder.Box animate="fade" height={16} width={"100%"} radius={4} />
        <VSpacer size={4} />
      </View>
    ))}
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

export { InitiativeRulesInfoBox, InitiativeRulesInfoBoxSkeleton };
