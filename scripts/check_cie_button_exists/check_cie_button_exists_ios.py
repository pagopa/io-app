import requests
import re
import os


class CieButton:
    def __init__(self, uri="https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2"):
        # Starting uri. For ease of maintenace point to our API
        self._uri = uri
        self._nAttempts = 0
        # Server response
        self._response = None
        # As requests doesn't support JS, redirects stop. Then a post with the following payload is required
        self._payload = {
            "shib_idp_ls_exception.shib_idp_session_ss": "",
            "shib_idp_ls_success.shib_idp_session_ss": "false",
            "shib_idp_ls_value.shib_idp_session_ss": "",
            "shib_idp_ls_exception.shib_idp_persistent_ss":	"",
            "shib_idp_ls_success.shib_idp_persistent_ss":	"false",
            "shib_idp_ls_value.shib_idp_persistent_ss": "",
            "shib_idp_ls_supported": "",
            "_eventId_proceed": ""
        }

        # Headers for requests
        self._headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            'Accept-Encoding': 'identity, deflate, compress, gzip, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

    def requestAuthPage(self, maxAttempts=5):
        statusFlag = False
        while not (self._nAttempts >= 5 or statusFlag):
            self._response = requests.get(
                self._uri, headers=self._headers, allow_redirects=True)
            self._response = requests.post(
                self._response.url, headers=self._headers, data=self._payload, allow_redirects=True)
            self._nAttempts += 1
            statusFlag = (self._response.status_code == 200)

    def checkExists(self):
        # Check if the fetched page has the required JS function
        match = re.search("apriIosUL", self._response.text)
        return match is not None

    def postSlack(self):
        self._resetHeaders()
        slackToken = os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN", None)
        self._headers["Content-type"] = "application/json"
        self._headers["Authorization"] = "Bearer " + slackToken

        self._payload = {
            "text": "Funziona", "channel": '#io_status'}
        print(self._headers)
        self._response = requests.post("https://slack.com/api/chat.postMessage",
                                       headers=self._headers, data=self._payload, allow_redirects=True)
        print(self._response.status_code)

    def _resetHeaders(self):
        self._headers = {}


if __name__ == "__main__":
    myCieButton = CieButton()
    myCieButton.requestAuthPage(3)
    if (myCieButton.checkExists()):
        print("OK")
    myCieButton.postSlack()
