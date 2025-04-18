// eslint-disable-next-line complexity
export const mockI18nResolveKeyMessages = (key: string) => {
  switch (key) {
    case "datetimes.notValid":
      return "Data non valida.";
    case "features.pn.details.badge.legalValue":
      return "Valore legale";
    case "global.accessibility.dateFormat":
      return "DD MMMM YYYY";
    case "global.dateFormats.dayMonthWithoutTime":
      return "%d %b";
    case "global.date.invalid":
      return "data non valida";
    case "global.dateFormats.dayMonth":
      return "DD/MM";
    case "messages.accessibility.message.archive":
      return "archiviare";
    case "messages.accessibility.message.description":
      return "{{newMessage}} {{selected}}, ricevuto da {{organizationName}}, {{serviceName}}. {{subject}}. {{receivedAt}}. {{instructions}}";
    case "messages.accessibility.message.deselectInstructions":
      return "Tieni premuto per deselezionare";
    case "messages.accessibility.message.read":
      return "Messaggio";
    case "messages.accessibility.message.received_at":
      return "ricevuto alle ore";
    case "messages.accessibility.message.received_on":
      return "ricevuto il";
    case "messages.accessibility.message.selectInstructions":
      return "Tieni premuto per selezionare e in seguito";
    case "messages.accessibility.message.selected":
      return "selezionato";
    case "messages.accessibility.message.unarchive":
      return "disarchiviare";
    case "messages.accessibility.message.unread":
      return "Messaggio non letto";
    case "messages.badge.paid":
      return "Pagato";
    case "messages.errorLoading.noTitle":
      return "Senza titolo";
    case "messages.errorLoading.senderInfo":
      return "Mittente sconosciuto";
    case "messages.errorLoading.serviceInfo":
      return "Info sul servizio mancanti";
    case "messages.yesterday":
      return "ieri";
    default:
      return key;
  }
};

describe("mockI18nResolveKeyMessages", () => {
  it("should return default key if missing", () => {
    const output = mockI18nResolveKeyMessages("unknown.key");
    expect(output).toBe("unknown.key");
  });
});
