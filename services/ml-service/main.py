import asyncio
import base64
import concurrent.futures
import functools
import io
from threading import Thread
from time import sleep

import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, Response, StreamingResponse
from PIL import Image
from detect import YoloV5_Detect

detect = YoloV5_Detect()

app = FastAPI(
    openapi_url='/api/v1/yolo-obj-detect/openapi.json',
    docs_url='/api/v1/yolo-obj-detect/docs',
    redoc_url='/api/v1/yolo-obj-detect/redoc',
    title='YOLO detect object',
    version='1.0.0',
)

@app.post('/api/v1/yolo-obj-detect/images/detect')
async def detect_image(file:bytes = File()):
    img = Image.open(io.BytesIO(file))
    image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    labels = detect.predict(image)
    return labels


# @app.post('/api/v1/yolo-obj-detect/images/predict')
# async def detect_image(file:bytes = File()):
#     image_base64 = np.fromstring(base64.b64decode(file), dtype=np.uint8)
#     image_base64 = cv2.imdecode(image_base64, cv2.IMREAD_ANYCOLOR)
#     labels = detect.predict(image_base64)
#     return labels

if __name__ == '__main__':
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=8000,
        reload=True,
        log_level='info'
    )
