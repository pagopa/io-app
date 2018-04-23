# This script is used during development to allow mitmproxy to intercept request on specific ports and make a proxy-pass on localhost
# Usage: SIMULATOR_HOST_IP=XXXXX mitmweb --listen-port 9060 --web-port 9061 --ssl-insecure -s mitmproxy_metro_bundler.py
import os
from mitmproxy import ctx

def request(flow):
    if flow.request.host == os.environ.get("SIMULATOR_HOST_IP") and (flow.request.port == 8081 or flow.request.port == 8082 or flow.request.port == 8097):
      flow.request.host = "127.0.0.1"
