# This script is used during development to allow mitmproxy to intercept request on specific ports and make a proxy-pass on localhost
# Usage: SIMULATOR_HOST_IP=XXXXX mitmweb --listen-port 9060 --web-port 9061 --ssl-insecure -s scripts/mitmproxy_metro_bundler.py
import os
from mitmproxy import http


def request(flow: http.HTTPFlow):
	if flow.request.host == os.environ.get(
	    "SIMULATOR_HOST_IP") and flow.request.port == 8081:
		flow.request.host = "127.0.0.1"
