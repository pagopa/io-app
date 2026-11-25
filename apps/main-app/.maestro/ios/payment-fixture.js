const messages = "http://127.0.0.1:3000/api/communication/v1/messages";
function get(url) {
  const result = http.get(url);
  if (result.status !== 200) {
    throw new Error("Local notice lookup failed: HTTP " + result.status);
  }
  return json(result.body);
}
function literal(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const notice = get(messages + "?enrich_result_data=true").items.find(
  item =>
    item.category.tag === "PAYMENT" &&
    item.message_title.trim() === "💰✅ payment - 0"
);
if (!notice) {
  throw new Error(
    "Default payable notice missing from local inbox; restart the dedicated dev API."
  );
}
const payment = get(messages + "/" + notice.id).content.payment_data;
output.noticeSubject = literal(notice.message_title.trim());
output.creditor = literal(notice.organization_name);
output.amount = (payment.amount / 100).toFixed(2).replace(".", ",") + " €";
