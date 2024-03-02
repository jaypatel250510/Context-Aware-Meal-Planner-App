# Project Overview
This is an Android application to simplify meal planning by providing personalized recommendations. This app utilizes artificial intelligence and data analytics to customize meal suggestions based on individual health profiles, dietary preferences, and real-time health indicators such as heart rate. As part of Project 5, the application analyzes various metrics, including the user's required calorie intake, location, and weather conditions. It also takes into account critical factors like local and seasonal food availability, as well as any dietary preferences or restrictions. Using this comprehensive analysis and the user's profile, the app generates a personalized daily meal plan and identifies nearby grocery stores where users can purchase the necessary food ingredients.

# Getting Started

>**Note**: Make sure you have your Android device connected with USB Debugging enabled and have Node installed on your computer with version >= 16.

## Step 1: Install NPM Dependencies

To install all the dependencies, run the following command from the root of the project:

```bash
# using npm
npm install

# OR using Yarn
yarn install
```

## Step 2: Start the Metro Server

First, you will need to start **Metro**

To start Metro, run the following command from the _root_ of the project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 3: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of the project. Run the following command to start the app:

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

If everything is set up _correctly_, you should see your new app running on your phone.

This is one way to run your app — you can also run it directly from within Android Studio.