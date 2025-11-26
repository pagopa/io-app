import { FeatureInfo, IOButton, VStack } from "@pagopa/io-app-design-system";
import { constUndefined } from "fp-ts/lib/function";
import i18n from "i18next";
import { useIODispatch } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { identificationRequest } from "../../../identification/store/actions";

const BsFooterButton = () => {
  const dispatch = useIODispatch();
  const handlePress = () => {
    dispatch(
      identificationRequest(
        true,
        false,
        undefined,
        {
          label: i18n.t("global.buttons.cancel"),
          onCancel: constUndefined // TBD
        },
        {
          onSuccess: constUndefined // TBD
        }
      )
    );
  };

  return (
    <IOButton
      fullWidth
      variant="solid"
      label={i18n.t("global.buttons.continue")}
      onPress={handlePress}
    />
  );
};
type NameProp = {
  name: string;
};
const BsBody = ({ name }: NameProp) => {
  const featureInfoText = i18n.t(
    "features.pn.aar.flow.delegated.notAdressee.bottomSheet.featureInfos",
    { returnObjects: true, name }
  );
  return (
    <VStack space={24}>
      <FeatureInfo
        pictogramProps={{
          name: "cie"
        }}
        body={featureInfoText[0]}
      />
      <FeatureInfo
        pictogramProps={{
          name: "stopSecurity"
        }}
        body={featureInfoText[1]}
      />
      <BsFooterButton />
    </VStack>
  );
};

export const useSendAarDelegationProposalScreenBottomSheet = (
  citizenFullName: string
) =>
  useIOBottomSheetModal({
    title: i18n.t(
      "features.pn.aar.flow.delegated.notAdressee.bottomSheet.title"
    ),
    component: <BsBody name={citizenFullName} />
  });
