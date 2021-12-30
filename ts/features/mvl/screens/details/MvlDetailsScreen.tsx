import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import CtaBar from "../../../../components/messages/paginated/MessageDetail/common/CtaBar";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  serviceByIdSelector,
  serviceMetadataByIdSelector
} from "../../../../store/reducers/entities/services/servicesById";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { loadServiceDetail } from "../../../../store/actions/services";
import { Mvl } from "../../types/mvlData";
import { MvlAttachments } from "./components/attachment/MvlAttachments";
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
  useEffect(() => {
    if (service === undefined) {
      dispatch(loadServiceDetail.request(props.mvl.message.serviceId));
    }
  }, [dispatch, props.mvl.message.serviceId, service]);

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex} testID={"MvlDetailsScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <MvlDetailsHeader
            mvl={props.mvl}
            hasAttachments={hasAttachments}
            service={service}
          />
          <MvlBody body={props.mvl.legalMessage.body} />
          <View spacer={true} large={true} />
          <MvlAttachments attachments={props.mvl.legalMessage.attachments} />
          <View spacer={true} />
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
  const service = pot
    .toOption(
      serviceByIdSelector(props.mvl.message.serviceId)(state) || pot.none
    )
    .map(toUIService)
    .toUndefined();

  const serviceMetadata = serviceMetadataByIdSelector(
    props.mvl.message.serviceId
  )(state);

  return { service, serviceMetadata };
};
