import os
from PIL import Image

UPLOAD_FOLDER = "./uploads"


def get_heart_rate_helper(filename):
    os.system(
        "ffmpeg -i "
        + str(f"{UPLOAD_FOLDER}/{filename}")
        + " -r 10 "
        + str(f"{UPLOAD_FOLDER}/temp/")
        + "image-%3d.jpeg"
    )
    image_files = [
        f
        for f in os.listdir(f"{UPLOAD_FOLDER}/temp/")
        if f.startswith("image") and f.endswith("jpeg")
    ]

    image_files = sorted(
        [f"{UPLOAD_FOLDER}/temp/" + image_file for image_file in image_files]
    )

    # print(len(image_files))

    a = []
    for image in image_files:
        im = Image.open(image)
        width, height = im.size

        maxW = width // 2
        maxH = height // 2

        bkt = 0

        for i in range(maxW - 50, maxW + 50):
            for j in range(maxH - 50, maxH + 50):
                r, g, b = im.getpixel((i, j))
                bkt += int(r) + int(g) + int(b)

        a.append(bkt)
        os.remove(image)

    os.remove(f"{UPLOAD_FOLDER}/{filename}")

    b = []

    for i in range(len(a) - 5):
        temp = (a[i] + a[i + 1] + a[i + 2] + a[i + 3] + a[i + 4]) // 5
        b.append(temp)

    # print(len(b))

    x = b[0]
    count = 0

    for i in range(1, len(b)):
        p = b[i]
        if (p - x) > 3500:
            count += 1
        x = b[i]

    # print(count)

    return (count * 30) // 45
