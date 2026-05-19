import { Body, VSpacer } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader";

export const DSHeaderSecondLevelWithSectionTitle = () => (
  <IOScrollViewWithLargeHeader
    title={{
      section: "Apri una richiesta",
      label: "Seleziona un argomento"
    }}
    includeContentMargins
  >
    <Body>
      Aiutaci a capire meglio come possiamo aiutarti selezionando l’argomento
      del tuo problema: ti risponderemo il prima possibile, in orario
      lavorativo.
    </Body>
    <VSpacer />
    {[...Array(40)].map((_el, i) => (
      <Body key={`body-${i}`}>Repeated text</Body>
    ))}
  </IOScrollViewWithLargeHeader>
);
