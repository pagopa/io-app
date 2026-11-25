const server = "http://127.0.0.1:3000";
const created = http.post(server + "/api/v1/message", {
  headers: { "Content-Type": "application/json" },
  body: "{}"
});
if (created.status !== 201) {
  throw new Error("Local message creation failed: HTTP " + created.status);
}
const message = json(created.body);
const service = http.get(
  server + "/api/catalog/v1/services/" + message.sender_service_id
);
if (service.status !== 200) {
  throw new Error("Local sender lookup failed: HTTP " + service.status);
}

// Maestro text selectors are regular expressions; fixture values are literal text.
function literal(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
output.subject = literal(message.content.subject);
output.body = literal(message.content.markdown.split("\n")[0]);
output.sender = literal(json(service.body).organization.name);
