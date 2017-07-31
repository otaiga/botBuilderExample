// Use dotenv to read from an env file
require('dotenv').config();
// Use resify for the web server framework
const restify = require('restify');
// Use botbuilder for the bot framework SDK
const builder = require('botbuilder');

// Setup Restify Server
const port = process.env.port || 3978;

const server = restify.createServer();
server.listen(port, () => {
  console.log(`listening on ${port}`); 
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
const recognizer = new builder.LuisRecognizer(process.env.ENDPOINT_URL);

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Check for user name in the session data
const userName = session =>
  session.userData.username;

// Receive messages from the user and respond if not matched with any dialogs
// Checks for greeting a user by name.
// Contains an array of functions known as a waterfall dialog.
// This allows the bot to easily walk a user through a series of tasks.
const bot = new builder.UniversalBot(connector, [
  (session) =>
    session.beginDialog('greet'),
  (session) =>
    session.endDialog(`${helpMessage}. Type help if you need assistance.`),
]);

// add the LUIS recognizer to the bot
bot.recognizer(recognizer);

// Enable Conversation Data persistence
bot.set('persistConversationData', true);

// Array of jokes to tell
const jokes = [
  { question: 'What do you get when you cross a snowman and a vampire?', answer: 'Frostbite!' },
  { question: 'What do elves learn in school?', answer: 'The elf-abet' },
  { question: 'Why are seaguls called seagulls?', answer: 'Beacause if they flew over the bay, they would be bagels!' },
  { question: 'How do you make a tissue dance?', answer: 'You put a little boogie in it' },
];

const helpMessage = 'Try asking me things like tell me a joke';

// Get a random joke
const getRandomJoke = () =>
  jokes[Math.floor(Math.random() * jokes.length)]

// dialog that match a help intent and checks for greeting a user by name.
// Contains an array of functions known as a waterfall dialog.
// This allows the bot to easily walk a user through a series of tasks.
bot.dialog('help', [
  (session) =>
    session.beginDialog('greet'),
  (session) =>
  session.endDialog(helpMessage),
]).triggerAction({
  matches: 'help'
});

// dialog that match a joke intent
bot.dialog('joke', (session) => {
  // Get a random joke
  const joke = getRandomJoke();
  // Send the question
  session.send(joke.question);
  // Send the punchline
  session.endDialog(joke.answer)
}).triggerAction({
  matches: 'joke'
});

// greet user
bot.dialog('greet', [
  (session, args, next) => {
    if (userName(session)) {
      // If user exists auto execute the next step in the waterfall.
      return next({response: userName(session)});
    }
    // Ask the user a question
    builder.Prompts.text(session, 'Before get started, can you please tell me your name?')
  },
  (session, results) => {
    // Assign the user's name response to the session data
    session.userData.username = results.response;
    return session.endDialog(`Hi ${results.response}`);
  }
]);

// reset bot dialog
bot.dialog('reset', (session) => {
  // reset data
  delete session.userData.username;
  session.endDialog('Oops... I\'m suffering from a memory loss...');
}).triggerAction({
  matches: /^reset/i
});
