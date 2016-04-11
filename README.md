# VendFit_App

## Synopsis

This project is one of three components to the main VendFit System project. This component is the Apache Cordova application (currently only built and tested for an Android device) which allows for user interaction with the VendFit machine, synchronization with a user's Fitbit account, and communicates with the VendFit Server's master database.

## Installation

NPM is needed to install the Apache Cordova CLI, which is then used to build this application. On the command prompt, type * npm install -g cordova *, or go to https://cordova.apache.org/ for installation instructions.

Once the Apache Cordova CLI is installed, go into the VendFit_App folder, and type * cordova build android *. This will place the apk in the /platforms/android/build/outputs/apk folder.

## Contributors

Chris Allen and Tyler Gauch