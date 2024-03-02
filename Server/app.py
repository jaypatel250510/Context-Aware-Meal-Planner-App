from flask import Flask, request
import os
from werkzeug.utils import secure_filename
from utils.get_heart_rate_helper import get_heart_rate_helper
from utils.upload_health_profile import upload_health_profile
from utils.open_ai import find_ingredient

app = Flask(__name__)
UPLOAD_FOLDER = "./uploads"

@app.route("/get-heart-rate", methods=["POST"])
def get_heart_rate():
    try:
        file = request.files["video"]
        filename = secure_filename(file.filename)

        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        file.save(os.path.join(UPLOAD_FOLDER, filename))
        heart_rate = get_heart_rate_helper(filename)

        return str(heart_rate)
    except:
        return "Some error occured"

@app.route("/store-health-profile", methods=["POST"])
def store_health_profile():
    try:
        data = request.json
        res = upload_health_profile(data)
        return res
    except:
        return "Some error occured"


@app.route("/get-diet-plan", methods=["POST"])
def get_diet_plan():
    try:
        val = find_ingredient(request.json)
        return val or "Not found"
    except:
        return "Something went wrong"
