import React from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { DocumentViewer } from "../../components/DocumentViewer";
import { FciParamsList } from "../../navigation/params";

export type FciDocumentPreviewScreenNavigationParams = Readonly<{
  documentUrl: string;
}>;

export const FciDocumentPreviewScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_DOC_PREVIEW">
): React.ReactElement => {
  const documentUrl = props.route.params.documentUrl;

  return <DocumentViewer documentUrl={documentUrl} />;
};
