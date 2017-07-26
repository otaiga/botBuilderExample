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

// Receive messages from the user and respond if not matched with any dialogs
const bot = new builder.UniversalBot(connector, session =>
  session.send(`Sorry, I did not understand ${session.message.text}. Type help if you need assistance.`));

// add the LUIS recognizer to the bot
bot.recognizer(recognizer);

// Array of jokes to tell
const jokes = [
  {question: 'What do you get when you cross a snowman and a vampire?', answer: 'Frostbite!' },
  {question: 'What do elves learn in school?', answer: 'The elf-abet' },
  {question: 'Why are seaguls called seagulls?', answer: 'Beacause if they flew over the bay, they would be bagels!' },
  {question: 'How do you make a tissue dance?', answer: 'You put a little boogie in it' },
];

// Get a random joke
const getRandomJoke = () =>
  jokes[Math.floor(Math.random() * jokes.length)]

// dialog that match a help intent
bot.dialog('help', session =>
  session.endDialog('Try asking me things like tell me a joke'))
  .triggerAction({
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

// TODO: Add waterfall pattern..(State)



