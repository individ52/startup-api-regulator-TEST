# startup-api-regulator-TEST
Project is made with using Vue.js.
This version of regulator can support engine work more than 1 minute (Was made different runs and all of them were much more, than 2 minutes). To control it, was made button "show show statistic". After several series of runnig code, click this button and there will be showed order of runs with time, what was engine work.

To not wait a lot, when engine explose, was made button "finish", that stop working of engine. after click this button, you can start engine again or see statistic.

At first, when I started compliting the task, I collapsed with problem, that I cannot connect to your API from my localhost. I find single solution - launch google with disabled web security.
Problem description:

Access to fetch at 'https://warp-regulator-bd7q33crqa-lz.a.run.app/api/start' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

Steps to solve this problem (what I used):
1. win+R
2. passed there string below:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/Chrome dev session" --disable-web-security"
3. In opened window go to 'localhost:3000'

To Start code working:
1. Download code from github
2. install npm (npm i)
3. write in console: npm run start

TASK WAS:

To keep things regulated you have access to the following REST API's:

Start - This fires up the engine. And gives you access code to other apis. Run this first.

Status - This gives you the status of the engine. Don't call this api more than once per second. There are two parameters in response:

1. intermix - number between 0 - 1, if it is less than 0.5, it means more antimatter than matter is being injected, if it's more than 0.5 it means more matter than antimatter is being injected. Your goal is to keep it close to 0.5

2. flow rate - this shows how much of both matter and antimatter is being injected into the chamber. It can be OPTIMAL, meaning flow rate is good, HIGH, meaning too much of components are being injected or LOW, meaning not enough is being injected. Keep this in mind when making adjustments.

Adjust matter/antimatter - You can pass your adjustment to these apis. You can make both positive and negative adjustments. Make sure you don't pass values greater than 0.2 to the api.

