import os
import unittest
import json
import requests
import check_cie_button_exists_ios as CieBtn


class CieButtonCheckTest(unittest.TestCase):
    def testPostSlackSuccess(self):
        response = CieBtn.postSlack(
            token=os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN", None),
            message="Unit Test of check_cie_button_exists_ios.py",
            uri="https://slack.com/api/chat.postMessage",
            channel='#io_status')

        self.assertEqual(response.status_code, 200)

        responseData = response.json()
        self.assertTrue(responseData['ok'])

    def testPostSlackFailure(self):
        # Wrong uri
        response = CieBtn.postSlack(
            token=os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN", None),
            message="Unit Test of check_cie_button_exists_ios.py",
            uri="https://slack.com/apxxxi/chat.postMessage",
            channel='#io_status')

        self.assertNotEqual(response.status_code, 200)

    def testUriFailureMain(self):
        # Wrong uri
        with self.assertRaises(SystemExit):
            CieBtn.main(
                uri="https://app-backend.io.germania.it/login?entityID=xx_servizicie&authLevel=SpidL2",
                headers=CieBtn.cieHeaders,
                payload=CieBtn.ciePayload,
                maxAttempts=5)

    def testUriFailureRequestCiePage(self):
        # Wrong uri
        with self.assertRaises(requests.exceptions.RequestException):
            CieBtn.requestCieAuthPage(
                uri="https://app-backend.io.germania.it/login?entityID=xx_servizicie&authLevel=SpidL2",
                headers=CieBtn.cieHeaders,
                payload=CieBtn.ciePayload,
                maxAttempts=5)

    def testPatternFailure(self):
        with self.assertRaises(SystemExit):
            CieBtn.main(
                uri="https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2",
                headers=CieBtn.cieHeaders,
                payload=CieBtn.ciePayload,
                maxAttempts=5,
                pattern="Trump Wins")


if __name__ == '__main__':
    unittest.main()
