# BotBuilder Example

This tutorial walks through building a bot by using:

  - Microsoft LUIS (Language Understanding Intelligent Service)
  - The Bot Builder SDK for Node.js
  - Bot Framework Emulator for testing the bot

## Get Started
  - Create an account for <a href="https://www.luis.ai/" target="_blank">LUIS</a>
  - <a href="https://nodejs.org/en/" target="_blank">Node.js</a> (working with 6.10) installed
  - clone or download this repo
  - From a command prompt or terminal, navigate to the repo folder
  - type `npm install`

### The Code

The main code for running your bot can be found in the `app.js` file.
Most of the code have comments describing what each part does.

The code basically allows you to do the following:

  - Sets up a local web service to listen for user messages
  - Connects to LUIS in order to find out what the user wants to know.
  - Responds back to the user with hopefully what the user asked for.

If we test the bot now (descibed in the below sections), then we wont get very far as the intents are never matched.
You would always get the default response: `Type help if you need assistance.`

(Although it will ask for your name, which is explained in the below sections).

In order to get this all working with LUIS we need to first create a LUIS app.

### LUIS

#### Create LUIS app

In this example we already have two dialogs in place that match intents for `help` and `joke`.

We want to be able to use a <a href="https://www.luis.ai/applications" target="_blank">LUIS</a> app in order to match these intents.

  - Create a new LUIS app
    - Name: JokeBot
    - Description: For telling jokes
    - Key to use: Leave blank
    - Click Create!

You will be directed to your new application, but, you have no intents yet.

#### Create LUIS Intents

Intents are the building blocks of your app; they link user requests with the actions that should be taken by your app.

So lets get started by creating your first intent:

  - Create an Intent
    - either by clicking on the intents menu on the left hand side, or 
    - the pop up that appears when you first create your app.
    - click Add intent
      - Name: joke
      - click save

We now have our first intent created, but now we need to include some utterances to train the intent.
(Utterances are sentences representing examples of user queries or commands that your application is expected to receive and interpret.)

#### Add LUIS Utterances

We can start by adding a few utterances like:

  - tell me a joke
  - joke
  - give me a joke
  - what jokes do you know

These will appear in the table as `Not trained`, but we'll get to that.

Next, you want to `Save` your utterances and then select `Train & Test` on the left-hand menu.

Select `Train Application` and after it has finished you should be able to test your utterances.

Type: `tell me a joke` in the input and your should get something back similar to:

```
Top scoring intent
joke (1)
Other intents
None (0.09)
```

We should now create another intent to match `help`. 

Select `Intents` from the left-hand menu and then follow the same steps as previously to create an intent with a name of `help`

We can start by adding a few utterances like:

  - help me
  - I need help
  - what can you do

`Save` your utterances and then select `Train & Test` again from the left-hand menu.

`Train Application` again and after it has finished you should be able to test your new utterances for `help`.

#### Publish

If your happy with your intent, we can select `Publish App` from the menu on the left hand side.

  - Select `BootStrapKey` as the Endpoint Key
  - Change the Endpoint slot to `Staging` under Publish settings
  - Select `Publish`

You should now have an `Endpoint URL` that we can copy and use inside our code!

Example:

```
https://region.api.cognitive.microsoft.com/luis/v2.0/apps/made-up-code-?subscription-key=somekeyto use&staging=true&verbose=true&timezoneOffset=0&q=
```

## Update the code

Create a `.env` file in your root directory and paste your LUIS URL in the below format (if you want rename and edit the example in the project .env_example).

```

ENDPOINT_URL='https://region.api.cognitive.microsoft.com/luis/v2.0/apps/made-up-code-?subscription-key=somekeyto use&staging=true&verbose=true&timezoneOffset=0&q='

```

The code will use this URL to set the LUIS `recognizer` used by the Bot Framework. This allows the bot to understand free-text questions and map them to intents.

You can locate the relevant code within the `app.js file`.

```
const recognizer = new builder.LuisRecognizer(process.env.ENDPOINT_URL);

```

### Start your bot

After installing the emulator, navigate to your bot's directory in a console window and start your bot:

 - type `node app.js`

## Test your bot

Test your bot by using the Bot Framework Emulator to see it in action. The emulator is a desktop application that lets you test and debug your bot on localhost.

First, you'll need to <a href="https://emulator.botframework.com/" target="_blank">download</a> and install the emulator. Pick the latest version that the correct download for your machine:

 - Mac - `botframework-emulator-n.n.nn-mac.zip`
 - PC - `botframework-emulator-Setup-n.n.nn.exe`

After the download completes, launch the executable and you are asked to enter some additional information:

 - Endpoint URL is: `http://127.0.0.1:3978/api/messages`.
 - Leave `Microsoft App ID` and `Microsoft App Password` blank.
 
 Select `CONNECT`.

 Where the emulator asked you to `Type your message`, enter an utterance the same as, or similar to, the `joke` and `help` utterences you added to LUIS. You should find the bot responds with either a joke or starts a conversation to provide help.

 Congratulations, you now have a basic working bot!

## Add more to your bot

You can start adding more functionality to your bot, for example, remembering your name.

There is code already within this example that checks for a username:

```
// greet user
bot.dialog('greeter', [
  (session, args, next) => {
    if (userName(session)) {
      return next({response: userName(session)});
    }
    builder.Prompts.text(session, 'Before get started, can you please tell me your name?')
  },
  (session, results) => {
    session.userData.username = results.response;
    return session.endDialog(`Hi ${results.response}`);
  }
]);

```

The above dialog allows the bot to ask for the name of the user and stores the response into the session data `session.userData` for later use.

We can then `greet` the user via other dialogs as in the help dialog:

```
// dialog that match a help intent
bot.dialog('help', [
  (session) =>
    session.beginDialog('greet'),
  (session) =>
  session.endDialog(helpMessage),
]).triggerAction({
  matches: 'help'
});

```

### Reset

A `reset` dialog exists in the code that matches the specific `reset` request by the user.

```
// reset bot dialog
bot.dialog('reset', (session) => {
  // reset data
  delete session.userData.username;
  session.endDialog('Oops... I\'m suffering from a memory loss...');
}).triggerAction({
  matches: /^reset/i
});
```

Type `reset` into the emulator and your bot will forget who you are.
