import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H2 } from "../../../../components/core/typography/H2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import CtaBar from "../../../../components/messages/MessageDetail/common/CtaBar";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { loadServiceDetail } from "../../../../store/actions/services";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../../store/reducers/types";
import { UIAttachment } from "../../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import MVL_ROUTES from "../../navigation/routes";
import { Mvl } from "../../types/mvlData";
import { MessageAttachments } from "../../../messages/components/MessageAttachments";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { MvlBody } from "./components/MvlBody";
import { MvlDetailsHeader } from "./components/MvlDetailsHeader";
import { MvlMetadataComponent } from "./components/MvlMetadata";

type Props = { mvl: Mvl };

/**
 * This screen displays all the details for a MVL:
 * - Header
 * - Body
 * - Attachments
 * - Metadata
 * - Cta Footer
 *
 * @constructor
 * @param props
 */
export const MvlDetailsScreen = (props: Props): React.ReactElement => {
  const hasAttachments = props.mvl.legalMessage.attachments.length > 0;
  const { service, serviceMetadata } = useIOSelector(state =>
    selectServiceState(state, props)
  );
  const dispatch = useIODispatch();
  const navigation = useNavigation();

  useEffect(() => {
    if (service === undefined) {
      dispatch(loadServiceDetail.request(props.mvl.message.serviceId));
    }
  }, [dispatch, props.mvl.message.serviceId, service]);

  const messageId = props.mvl.message.id;
  const openAttachment = useCallback(
    (attachment: UIAttachment) => {
      navigation.navigate(MVL_ROUTES.ATTACHMENT, {
        messageId,
        attachmentId: attachment.id
      });
    },
    [messageId, navigation]
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex} testID={"MvlDetailsScreen"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <MvlDetailsHeader
            mvl={props.mvl}
            hasAttachments={hasAttachments}
            service={service}
          />
          <MvlBody body={props.mvl.legalMessage.body} />
          <VSpacer size={24} />
          <ItemSeparatorComponent noPadded={true} />
          <VSpacer size={24} />
          <H2>{I18n.t("features.mvl.details.attachments.title")}</H2>
          <MessageAttachments
            attachments={props.mvl.legalMessage.attachments}
            openPreview={openAttachment}
          />
          <VSpacer size={16} />
          <MvlMetadataComponent metadata={props.mvl.legalMessage.metadata} />
        </ScrollView>
        {/* TODO: TMP, how is calculated isPaid without using the paginated data? https://pagopa.atlassian.net/browse/IAMVL-22 */}
        <CtaBar
          isPaid={false}
          messageDetails={props.mvl.message}
          service={service}
          serviceMetadata={serviceMetadata}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const selectServiceState = (state: GlobalState, props: Props) => {
  const service = pipe(
    pot.toOption(
      serviceByIdSelector(props.mvl.message.serviceId)(state) || pot.none
    ),
    O.map(toUIService),
    O.toUndefined
  );

  const serviceMetadata = serviceMetadataByIdSelector(
    props.mvl.message.serviceId
  )(state);

  return { service, serviceMetadata };
};
