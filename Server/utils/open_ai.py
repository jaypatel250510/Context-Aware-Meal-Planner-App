from openai import OpenAI
from utils.get_recipe import get_recipe
import json
import math

OPENAI_API_KEY = "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"
SEED = 42
MODEL = "gpt-3.5-turbo-1106"

client = OpenAI(api_key=OPENAI_API_KEY)


# one of three SEASON - Summer, Winter, Rain
def find_ingredient(req):
    try:
        PROMPT = "give me a list of {} foods which are local and seasonal in {} in {}. Give only a list, no other text".format(
            req["noOfMeals"], req["location"], req["season"]
        )
        response = client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant designed to output JSON.",
                },
                {"role": "user", "content": PROMPT},
            ],
            seed=SEED,
        )
        obj = json.loads(response.choices[0].message.content)
        foodList = []
        if "foods" in obj:
            foodList = obj["foods"]
        elif "foodList" in obj:
            foodList = obj["foodList"]
        recipes = []
        cal_per_meal = math.ceil(req["calories"] / req["noOfMeals"])
        for ingredient in foodList:
            recipes.append(get_recipe(ingredient, cal_per_meal, req["restrictions"]))
        return recipes
    except Exception as err:
        print(err)
        return err
