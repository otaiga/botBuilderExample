// 'REQUIRE' THE MODULES WE ARE GOING TO USE

// Use dotenv to read from an env file
require('dotenv').config();

// Use Restify for the web server framework
const restify = require('restify');

// Use botbuilder for the bot framework SDK
const builder = require('botbuilder');


// SETUP RESTIFY WEB SERVER

// Define the port the webserver listens on
const port = process.env.port || 3978;

// Create the Restify server on that port and start listening for connections
const server = restify.createServer();
server.listen(port, () => {
  console.log(`listening on ${port}`); 
});


// SETUP BOT FRAMEWORK STUFF

// Create chat connector for communicating with the Bot Framework
const connector = new builder.ChatConnector();

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond if not matched with any dialogs
// Checks for greeting a user by name.
// Contains an array of functions known as a waterfall dialog.
// This allows the bot to easily walk a user through a series of tasks.
const bot = new builder.UniversalBot(connector, [
  (session) =>
    session.beginDialog('greeter'),
  (session) =>
    session.endDialog('Type help if you need assistance.'),
]);

// Enable Conversation Data persistence
bot.set('persistConversationData', true);


// TELL BOT FRAMEWORK ABOUT LUIS

// You provide the url to your own model by specifing the 'ENDPOINT_URL' environment variable
// This url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/ (see README for instructions)
const recognizer = new builder.LuisRecognizer(process.env.ENDPOINT_URL);

// add the LUIS recognizer to the bot
bot.recognizer(recognizer);


// DEFINE JOKES, HELPER MESSAGES AND FUNCTIONS

// Array of jokes the bot can tell
const jokes = [
  { question: 'What do you get when you cross a snowman and a vampire?', answer: 'Frostbite!' },
  { question: 'What do elves learn in school?', answer: 'The elf-abet' },
  { question: 'Why are seagulls called seagulls?', answer: 'Because if they flew over the bay, they would be bagels!' },
  { question: 'How do you make a tissue dance?', answer: 'You put a little boogie in it' },
];

const helpMessage = 'Try asking me things like tell me a joke';

// Function to check for username stored in the session data
const userName = session =>
  session.userData.username;

// Function to pick a random joke from our array of jokes
const getRandomJoke = () =>
  jokes[Math.floor(Math.random() * jokes.length)]


// DEFINE OUR BOT CONVERSATION HANDLERS

// dialog that match a help intent and checks for greeting a user by name.
// Contains an array of functions known as a waterfall dialog.
// This allows the bot to easily walk a user through a series of tasks.
bot.dialog('help', [
  (session) =>
    session.beginDialog('greeter'),
  (session) =>
  session.endDialog(`You need help? ${helpMessage}`),
]).triggerAction({
  matches: 'help'
});

// conversation dialog that reacts to matching LUIS joke intent and tells a joke
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

// conversation dialog to greet the user
bot.dialog('greeter', [
  (session, args, next) => {
    if (userName(session)) {
      // If user exists auto execute the next step in the waterfall.
      return next({response: userName(session)});
    }
    // Ask the user a question
    builder.Prompts.text(session, 'Before get started, can you please tell me your name?');
  },
  (session, results) => {
    // Assign the user's name response to the session data
    session.userData.username = results.response;
    session.endDialog(`Hi ${results.response}`);
  },
]);

// conversation dialog to handle user typing 'reset'. Resets the bot dialog conversation back to the beginnning.
bot.dialog('reset', (session) => {
  // reset data
  delete session.userData.username;
  session.endDialog('Oops... I\'m suffering from a memory loss...');
}).triggerAction({
  matches: /^reset/i
});
