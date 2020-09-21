import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React, { ReactElement } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { RTron } from "../../boot/configureStoreAndPersistor";
import { loadServiceMetadata } from "../../store/actions/content";
import { servicesMetadataByIdSelector } from "../../store/reducers/content";
import { GlobalState } from "../../store/reducers/types";
import { CTA, CTAS } from "../../types/MessageCTA";
import { handleCtaAction, isCtaActionValid } from "../../utils/messages";
import { MessageNestedCtaButton } from "./MessageNestedCtaButton";

type OwnProps = {
  ctas: CTAS;
  xsmall: boolean;
  dispatch: Dispatch;
  service?: ServicePublic;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// render cta1 and cta2 if they are defined in the message content as nested front-matter
const MessageNestedCTABar: React.FunctionComponent<Props> = (
  props: Props
): ReactElement => {
  const handleCTAPress = (cta: CTA) => {
    handleCtaAction(cta, props.dispatch, props.service);
  };

  React.useEffect(() => {
    if (!props.serviceMetadata && props.service) {
      props.loadService(props.service);
    }
  }, []);

  const { ctas } = props;

  const cta2 = ctas.cta_2 &&
    isCtaActionValid(ctas.cta_2, props.serviceMetadata) && (
      <MessageNestedCtaButton
        cta={ctas.cta_2}
        xsmall={props.xsmall}
        primary={false}
        onCTAPress={handleCTAPress}
      />
    );
  const cta1 = isCtaActionValid(ctas.cta_1, props.serviceMetadata) && (
    <MessageNestedCtaButton
      cta={ctas.cta_1}
      primary={true}
      xsmall={props.xsmall}
      onCTAPress={handleCTAPress}
    />
  );
  return (
    <>
      {cta2}
      {cta2 && <View hspacer={true} small={true} />}
      {cta1}
    </>
  );
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const servicesMetadataByID = servicesMetadataByIdSelector(state);

  return {
    serviceMetadata: ownProps.service
      ? servicesMetadataByID[ownProps.service.service_id]
      : pot.none
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadService: (service: ServicePublic) =>
    dispatch(loadServiceMetadata.request(service.service_id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageNestedCTABar);
