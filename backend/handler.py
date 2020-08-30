import base64
import json
import typing

import cv2
import numpy


class AppRequest(typing.TypedDict):
    image_name: str
    image_body: str
    serialize_images: typing.Optional[bool]


def serialize_image(image) -> str:
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode()


def deserialize_image(base_64_image: str):
    image_bytes = base64.b64decode(base_64_image)
    numpy_array = numpy.fromstring(image_bytes, dtype=numpy.uint8)
    return cv2.imdecode(numpy_array, cv2.IMREAD_UNCHANGED)


def process_image(image):
    # converting the image to Gray
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # threshold value to remove white background
    ret, thresh_leaf = cv2.threshold(gray, 215, 255, cv2.THRESH_BINARY)

    # count leaf pixels
    leaf_pix = cv2.countNonZero(thresh_leaf)

    # threshold value to only see occluded stomata
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    ret, thresh_pseudo = cv2.threshold(gray, 90, 130, cv2.THRESH_BINARY_INV)

    # count pseudothecia pixels
    pseudo_pix = cv2.countNonZero(thresh_pseudo)

    severity = pseudo_pix / leaf_pix * 100
    return {
        "severity": severity,
        "images": {"gray": gray, "threshold": thresh_leaf, "stomata": thresh_pseudo},
    }


def app(event, _):
    request: AppRequest = json.loads(event["body"])

    image_bytes = base64.b64decode(request["image_body"])
    numpy_array = numpy.fromstring(image_bytes, dtype=numpy.uint8)
    image = cv2.imdecode(numpy_array, cv2.IMREAD_UNCHANGED)

    response = process_image(image)

    if request.get("serialize_images", False):
        response["images"] = {
            image_name: serialize_image(img)
            for image_name, img in response["images"].items()
        }
    else:
        del response["images"]

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
        },
        "body": json.dumps(response),
    }
