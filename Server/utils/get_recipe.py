from flask import jsonify
import requests

EDAMAM_ENDPOINT = "https://api.edamam.com/api/recipes/v2"
APP_ID = "67bf2114"
APP_KEY = "b9b59092ef1afd524ae62b3b02d5c9c9"
typeOfRecipe = "public"


def get_recipe(ingredient, calories, restrictions=[]):
    try:
        diet_options = [
            "balanced",
            "high-fiber",
            "high-protein",
            "low-carb",
            "low-fat",
            "low-sodium",
        ]
        url = "{}?app_id={}&app_key={}&type={}&q={}&calories={}".format(
            EDAMAM_ENDPOINT, APP_ID, APP_KEY, typeOfRecipe, ingredient, calories
        )
        if len(restrictions) > 0:
            diet_restrictions = []
            health_restrictions = []
            for rest in restrictions:
                rest = "-".join(rest.split(" ")).lower()
                if rest in diet_options:
                    diet_restrictions.append(rest)
                else:
                    health_restrictions.append(rest)
            if len(diet_restrictions):
                url += "&diet=" + "&".join(diet_restrictions)
            if len(health_restrictions):
                url += "&health=" + "&".join(health_restrictions)
        response = requests.get(url)
        if response.status_code == 200:
            api_data = response.json()
            return api_data["hits"][0]
        else:
            return jsonify(
                {"error": f"Failed to fetch data. Status code: {response.status_code}"}
            )
    except Exception as err:
        print(err)
