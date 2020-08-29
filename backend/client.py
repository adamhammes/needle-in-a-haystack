import argparse
import base64
import json
import types

import cv2
import requests

from handler import app, AppRequest, deserialize_image

lambda_url = "https://k3bth73v75.execute-api.us-east-1.amazonaws.com/dev"


if __name__ == "__main__":
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument("file")
    arg_parser.add_argument("--network", action="store_true")
    args = arg_parser.parse_args()

    with open(args.file, "rb") as file:
        file_content = file.read()

    as_base64 = base64.b64encode(file_content).decode()
    request_body: AppRequest = {"image_name": args.file, "image_body": as_base64}
    body_string = json.dumps(request_body)

    if args.network:
        _response = requests.post(lambda_url, json=request_body)
        print(_response.headers)
        response = _response.text
    else:
        request = {"body": body_string}
        response = json.loads(app(request, None)["body"])
