const server = "http://127.0.0.1:3000";
const created = http.post(server + "/maestro/paid-message", { body: "{}" });
if (created.status !== 201) {
  throw new Error(
    "Cannot seed paid notice; start the dev API with MAESTRO_FIXTURES=1. HTTP " +
      created.status
  );
}
const message = json(created.body);
const status = http.get(
  server + "/api/communication/v1/payment/info/" + message.rptId + "?test=true"
);
if (
  status.status !== 409 ||
  json(status.body).faultCodeDetail !== "PAA_PAGAMENTO_DUPLICATO"
) {
  throw new Error("Expected a duplicate-payment conflict for the new notice");
}
output.subject = message.subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
