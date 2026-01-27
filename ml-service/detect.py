import cv2
import matplotlib.pyplot as plt
import torch
import random

class YoloV5_Detect:
    def __init__(self):
        self.model_detect = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        self.objects = ['Người', 'Xe đạp', 'Ô tô', 'Xe máy', 'Máy bay',
        'Xe buýt', 'Tàu hỏa', 'Xe tải', 'Thuyền', 'Đèn giao thông',
        'Vòi cứu hỏa', 'Biển báo dừng', 'Đồng hồ đỗ xe', 'Ghế dài', 'Chim',
        'Mèo', 'Chó', 'Ngựa', 'Cừu', 'Bò',
        'Voi', 'Gấu', 'Ngựa vằn', 'Hươu cao cổ', 'Ba lô',
        'Ô', 'Túi xách', 'Cà vạt', 'Va li', 'Đĩa ném',
        'Ván trượt tuyết đôi', 'Ván trượt tuyết', 'Bóng thể thao', 'Diều', 'Gậy bóng chày',
        'Găng tay bóng chày', 'Ván trượt', 'Ván lướt sóng', 'Vợt tennis', 'Chai nước',
        'Ly rượu', 'Cốc', 'Nĩa', 'Dao', 'Muỗng',
        'Bát', 'Chuối', 'Táo', 'Sandwich', 'Quả cam',
        'Bông cải xanh', 'Cà rốt', 'Xúc xích', 'Pizza', 'Donut',
        'Bánh kem', 'Ghế', 'Đi văng', 'Chậu cây', 'Giường',
        'Bàn ăn', 'Nhà vệ sinh', 'TV', 'Laptop', 'Chuột máy tính',
        'Điều khiển từ xa', 'Bàn phím', 'Điện thoại di động', 'Lò vi sóng', 'Lò nướng',
        'Máy nướng bánh mì', 'Bồn rửa', 'Tủ lạnh', 'Sách', 'Đồng hồ',
        'Bình hoa', 'Kéo', 'Gấu bông', 'Máy sấy tóc', 'Bàn chải đánh răng']

    def predict(self,img):
        # img = cv2.imread(image_src)
        detect = self.model_detect(img)
        regions = detect.xyxy[0]
        result = []
        for (x0,y0,x1,y1,score,label) in regions:
            if label >= 1:
                object = {}
                object['object'] = self.objects[int(label)] 
                object['score'] = round(float(score) * 100, 2)
                object['coordinate'] = {'x0':int(x0), 'y0':int(y0), 'x1':int(x1), 'y1':int(y1)}
                result.append(object)

        return result
        # test sau
        # if len(detect.xyxy[0])==0: return None
        # coordinates = detect.xyxy[0][0]
        # coordinate = [int(coordinates[i]) for i in range(4)]
        # LpRegion = img[coordinate[1]:coordinate[3],coordinate[0]:coordinate[2]]
        # return LpRegion
