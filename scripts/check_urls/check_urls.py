import os
import re
import ssl
from multiprocessing import Manager, Pool, cpu_count
from os.path import abspath, basename, dirname, join
from pathlib import Path
from sys import argv
from typing import List

import certifi
import requests
import urllib3
from slack import WebClient
from slack.errors import SlackApiError
from urlextract import URLExtract

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
}
MAX_TIMEOUT = 20
global_uris = set()
SLACK_TOKEN = os.environ.get("IO_APP_SLACK_HELPER_BOT_TOKEN", None)
tagged_people = ["<!here>"]
SLACK_CHANNEL = "#io_dev_app_status"

# a list of remote uris consumed by the app for content presentation
remote_content_uri = ["https://assets.cdn.io.italia.it/bonus/bonus_available_v2.json",
                      "https://assets.cdn.io.italia.it/contextualhelp/data.json",
                      "https://assets.cdn.io.italia.it/status/backend.json"]


class IOUrl(object):

    def __init__(self, io_uri, source):
        self.uri = io_uri
        self.source = source
        self.has_error = False
        self.error = None

    def set_error(self, error):
        self.error = error
        self.has_error = True


def scan_directory(path, file_black_list, black_list_url, ext_set={'*.ts*'}):
    """
      Scan the chosen directory, and the sub-directories and returns the execution of read_file from the found collection of files
      :param path: directory to scan
      :param file_black_list: a set of files to exclude from scanning
      :param black_list_url: a set of urls to exclude from scanning
      :param ext_set: file extension to retrieve
      :return: a dictionary containing all uris found
    """
    path = path[:-1] if path[-1] == "/" else path
    files = []
    for ext in ext_set:
        files.extend(list(Path(path).rglob(ext)))
    to_remove = []
    black_list_files = tuple(file_black_list)
    # exclude test files
    for f in files:
        # exclude all those files that are included in the blacklist or are tests, mocks, or snaps
        if re.search(r'(__tests?__|__mocks?__|tsx.snap)', abspath(f), re.IGNORECASE) or str(f).endswith(black_list_files):
            to_remove.append(f)
            continue
    for tr in to_remove:
        files.remove(tr)
    return read_file(files, black_list_url)


def extract_uris(text, black_list_url={''}):
    extractor = URLExtract()
    urls = set(extractor.find_urls(text))
    urls = list(map(lambda r: r.replace(")", "").replace("}", ""),
                    filter(lambda r: r.startswith("http") or r.startswith("www"), urls)))
    urls_set = set(filter(lambda f: f not in black_list_url, urls))
    return urls_set


def read_file(files, black_list_url):
    """
    Reads the collection of files passed as parameter and returns the set of uris found inside all the files
    :param files: an iterable of file paths
    :param black_list_url: a set of urls to exclude from scanning
    :return: a dictionary containing all uris found (the key is the uri the value is the list of files where it is found)
    """
    uri_map = {}
    for path in files:
        with open(path, 'r') as f:
            content = f.read()
            uri_list = extract_uris(content)
            uri_list = list(
                filter(lambda f: f not in black_list_url, uri_list))
            for u in uri_list:
                if u in uri_map:
                    uri_map[u].append(basename(str(path)))
                else:
                    uri_map[u] = [basename(str(path))]
    return uri_map


def load_remote_content(uri_to_load):
    try:
        r = requests.get(uri_to_load, timeout=MAX_TIMEOUT)
        if r.ok:
            return r.text
        return None
    except:
        return None


def test_protocol(uri_to_test):
    """
    check if the protocol is http (it could cause a crash inside the app cause http is not allow)
    :param uri:
    :return:
    """
    if re.search(r'^http:', uri_to_test, re.IGNORECASE) is not None:
        return "has not https protocol"
    return None


def test_availability(uri_to_test):
    """
            Tests the uri passed as argument making an http get request.
            If it causes an exception or an error code the uri will be returned
            :param uri: the uri to test
            :return: the uri if it is problematic, None otherwise
            """
    try:
        r = requests.get(uri_to_test, headers=HEADERS,
                         timeout=MAX_TIMEOUT, verify=False)
        if r.ok:
            return None
        return "status code %d" % r.status_code
    except requests.exceptions.SSLError:
        # this is not an issue for the url availability
        return None
    except requests.ConnectionError as e:
        return "Connection Error - " + str(e)
    except requests.Timeout as e:
        return "Timeout - " + str(e)
    except requests.RequestException as e:
        return "General Error - " + str(e)
    except Exception as e:
        return str(e)


def test_http_uri(io_url: IOUrl):
    # a list of test to apply
    tests = [test_availability]
    for t in tests:
        res = t(io_url.uri)
        if res is not None:
            io_url.set_error(res)
    return io_url


def send_slack_message(invalid_uris_list: List[IOUrl]):
    """
    Sends the report of the check to slack to notify the status of the static texts of the app
    :return:
    """
    try:
        # avoid ssl certificate warning
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        rtm_client = WebClient(
            token=SLACK_TOKEN, ssl=ssl_context
        )
        if len(invalid_uris_list) > 0:
            tags = " ".join(tagged_people)
            message = "[URLs Check] :warning: %s There are %d uris in *IO App* that are not working" % (
                tags, len(invalid_uris_list))
            message_blocks = []
            message_blocks.append({
                "type": "section",
                "text": {
                        "type": "mrkdwn",
                    "text": message
                }
            })
            rtm_client.chat_postMessage(
                channel=SLACK_CHANNEL,
                blocks=message_blocks
            )
            message_blocks = []
            for iu in invalid_uris_list:
                message = "`%s` `%s` -> ```%s```" % (
                    iu.source, iu.error, iu.uri)
                message_blocks.append({
                    "type": "section",
                    "text": {
                            "type": "mrkdwn",
                        "text": message
                    }
                })
            rtm_client.chat_postMessage(
                channel=SLACK_CHANNEL,
                blocks=message_blocks
            )

    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        # str like 'invalid_auth', 'channel_not_found'
        assert e.response["error"]
        print(f"Got an error: {e.response['error']}")


run_test = len(argv) > 1 and argv[1] == "run_tests"

# since this code is executed multiple time for each process spawned
# we have to ensure the init part is execute only the first time
if not run_test and __name__ == '__main__':
    files_black_list = {"testFaker.ts", "PayWebViewModal.tsx", "paymentPayloads.ts", "message.ts",
                        "supportAssistance.ts", "ZendeskAskPermissions.tsx"}

    manager = Manager()
    print("scanning local folders...")
    all_uris = set()
    urls_black_list = {
        # 403 when this check runs (in the middle of the night)
        "https://id.lepida.it/docs/manuale_utente.pdf",
        # still not available
        "https://io.italia.it/carta-giovani-nazionale/informativa-beneficiari",
        # still not available
        "https://io.italia.it/carta-giovani-nazionale/guida-beneficiari",
        # the article is available but the response status code is 403
        "https://help.mixpanel.com/hc/en-us/articles/115004494803-Disable-Geolocation-Collection",
        "https://assets.cdn.io.italia.it",
        "https://www.trusttechnologies.it/wp-content/uploads/SPIDPRIN.TT_.DPMU15000.03-Guida-Utente-al-servizio-TIM-ID.pdf",
        "https://www.trusttechnologies.it/contatti/#form",
        "https://support.namirial.com/it/faq/faq-tsp/faq-tsp-spid",
        "https://paytipper.com/wp-content/uploads/2021/02/logo.png",
        "https://fims-dev-app-provider.azurewebsites.net/",
        # returns a 404 anytime the check runs but it actually works fine
        "https://checkout.pagopa.it/dona",
        # todo remove from blacklist when the url is available
        "https://io.italia.it/app-content/tos_privacy_cartacultura.html/",
        # todo remove from blacklist when the url is available
        "https://cittadini.notifichedigitali.it"
    }
    locales = (abspath(join(dirname(__file__), "../..", "locales")), set())
    ts_dir = (abspath(join(dirname(__file__), "../..", "ts")), files_black_list)
    for directory, black_list in [locales, ts_dir]:
        files_found = scan_directory(directory, black_list, urls_black_list)
        print("found %d files in %s" % (len(files_found.keys()), directory))
        all_uris.update(
            list(map(lambda kv: IOUrl(kv[0], "|".join(kv[1])), files_found.items())))
    print("scanning remote resources...")
    for ru in remote_content_uri:
        c = load_remote_content(ru)
        if c is not None:
            uris = extract_uris(c, urls_black_list)
            all_uris.update(list(map(lambda u: IOUrl(u, basename(ru)), uris)))
    pool = Pool(cpu_count())
    invalid_uri_processing = []
    print(
        f"found and processing {len(all_uris)} uris using {cpu_count()} cpus")
    for uri in all_uris:
        invalid_uri_processing.append(
            pool.apply_async(test_http_uri, args=(uri,)))
    # get all processes results
    invalid_uris = list(map(lambda r: r.get(), invalid_uri_processing))
    # remove None results from list
    invalid_uris = list(filter(lambda r: r.has_error, invalid_uris))
    pool.close()
    print('found %d broken or invalid uris' % len(invalid_uris))
    if len(invalid_uris):
        msg = '\nfound %d errors\n' % len(invalid_uris)
        msg += "\n".join(list(map(lambda iu: "[%s][%s] -> %s" %
                         (iu.source, iu.error, iu.uri), invalid_uris)))
        msg += "\n"
        print(msg)
        if SLACK_TOKEN:
            send_slack_message(invalid_uris)
        else:
            print("no SLACK token provided")

if run_test:
    print("running tests...")
    a_text_with_urls = '''[a](http://foo.com)
    [a](http://goo.gl)
    [a](https://foo.com)
    [a](https://www.foo.com)
    [a](https://www.foo.com/)
    [a](https://www.foo.com/bar)
    [a](http://goo.gl/1 http://goo.gl/2
    foo [a](http://goo.gl/1) [a](http://goo.gl/(2))
    [a](http://foo.com/.) [a](http://foo.com/)! [a](http://foo.com/),
    This url does not have a protocol: goo.gl/1
    [a](http://firstround.com/review/thoughts-on-gender-and-radical-candor/?ct=t(How_Does_Your_Leadership_Team_Rate_12_3_2015))
    [a](https://google.com)

    https:google.com

    www.cool.com.au

    [a](http://www.cool.com.au)

    [a](http://www.cool.com.au/ersdfs)

    [a](http://www.cool.com.au/ersdfs?dfd=dfgd@s=1)

    [a](http://www.cool.com:81/index.html)'''

    test1 = extract_uris("[hello world](http://test.com)")
    assert len(test1) == 1
    assert "http://test.com" in test1

    test2 = extract_uris(
        "[a](https://test2.com) hello world [b](http://test.com)")
    assert len(test2) == 2
    assert "https://test2.com" in test2
    assert "http://test.com" in test2

    test3 = extract_uris(
        "[a](https://www.test.com)      site.it        [b](https://empty)")
    assert len(test3) == 1
    assert "https://www.test.com" in test3

    test4 = extract_uris(a_text_with_urls)
    assert len(test4) == 18

    test5 = extract_uris("bla bla http://www.google.it")
    assert len(test5) == 1

    test6 = extract_uris("bla bla http://www.google.it",
                         ["http://www.google.it"])
    assert len(test6) == 0

    print("all tests passed")
