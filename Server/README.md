# Project Overview
This project is focused on developing the Python server for the [android application](https://github.com/Smit2010/Personalized-Context-Aware-Meal-Planner) to call the OpenAI API, which is employed to retrieve a curated list of local and seasonal foods tailored to the user's location. Upon obtaining this list of ingredients, the subsequent stage involves leveraging the EDAMAM API. Here, the Python server utilizes this API to formulate a comprehensive set of meals for a day. These meals are intelligently filtered based on many factors, including the user's dietary preferences, local and seasonal food availability, and any allergy restrictions. The final output, a thoughtfully curated meal plan, is then seamlessly returned to the user interface for presentation. This cohesive integration ensures that the user receives a personalized and nutritionally optimized meal plan. This application is deployed on AWS EC2 as well.

# Project Setup
>**Note**: To setup the project locally, make sure you have python v3.7+ installed on your computer

## Step 1: Install dependencies
```bash
pip3 install -r requirements.txt
```

## Step 2: Start Local Server
```bash
flask run
```

App should be ready and listening at [localhost](127.0.0.1:5000)

## Step 3: Test the server
To test the server, use the [Postman](https://github.com/Smit2010/Personalized-Context-Aware-Meal-Planner) setup. The setup by default points to the hosted server but to test the local server replace the url with _127.0.0.1:5000_
