require('dotenv').config();
const config = require('./config/config.json');
const weatherjson = require('./config/weather.json');
const Discord = require('discord.js');
const bot = new Discord.Client();
const logging = require('./modules/logging');
const callapi = require('./modules/callapi');
const TOKEN = process.env.discordToken;
var PREFIX = config.prefix;
const TYPE = process.env.gameType;
const SERVER = process.env.gameServer;
const PORT = process.env.gamePort;

var pjson = require('./package.json');



bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {

  //Bot Detection and ignore non-commands
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

  if (msg.content.startsWith(PREFIX + 'ping')) {
    msg.reply('pong');
    msg.channel.send('pong');
    logging.info('[CMD] '+msg.author.username + ' used ping');
    return;
  }

  if(msg.content.startsWith(PREFIX + 'version')) {
    msg.reply('I am currently on version ' + pjson.version);
    logging.info('[CMD]'+msg.author.username + ' used version. We are running ' + pjson.version);
    return;
  }

  if(msg.content.startsWith(PREFIX + 'online')) {
    callapi.query_game(TYPE, SERVER, PORT, 0)
      //If we get a bad API Call or fail to process result, Log Error
      .on('error', function(error) {
        logging.error('[API] Returned ' + error);
        msg.reply('I\'m sorry, something went wrong. :face_with_spiral_eyes:');
      })
      //On Good API Call
      .on('state', function(state) {
        //Send json to debug log from Result
        logging.debug('[API] State:' + JSON.stringify(state));
        //Pull number of players, Server name, and setup empty playerList
        var numPlayers = state.raw.numplayers;
        var serverName = state.name;
        var outputStr = '';


        if (numPlayers > 0) { //Actions to perform is people are online

          //Start putting together flavor text
          outputStr = 'I have looked into the ether.  On the ' + serverName + ', I see ' + numPlayers + ' soul';

          //if more than one player, add an "s" to individual
          if (numPlayers > 1) {
            outputStr = outputStr + 's playing. Maybe you are fated to join them?';
          }
          else {
            outputStr = outputStr + ' playing. Maybe you are fated to join them?';
          }

        }
        else { //No one is online :(
          outputStr = 'I currently see no souls within the ' + serverName + ' realm. Maybe you are destined to change that.';
        }

        //Send to chat as Reply
        msg.reply(outputStr);

        //Logg Command.
        logging.info('[CMD] '+msg.author.username+' has requested the game server status');
      });
    return;
  }

  //Simple Test command that sends text to chat
  if (msg.content.startsWith(PREFIX + 'tea')) {
    msg.reply('Here is your flaming ghost tea.');
    msg.channel.send(':ghost: :fire: :ghost:\n:fire: :tea: :fire:');
    logging.info('[CMD] '+msg.author.username+' ordered a refreshing ghost tea.');
    return;
  }

  //Weather Query
  if (msg.content.startsWith(PREFIX + 'weather')) {
    //Find Parameters
    let param = msg.content.replace(/ /,'&').split('&');

    //Confirm the Parameters exist
    if (param.length == 1) {
      //Format output message and return it
      var output = 'I need to know where to get the weather for.\n';
      output = output + PREFIX + 'weather : Gives you your weather if you put your city after it.  City must be listed either as <city>,<country>';
      msg.reply(output);
      //Enter Log entries
      logging.error('[CMD] '+msg.author.username+' tried to use '+PREFIX+'weather without a location');
      logging.debug('[REPLY] '+output);
      return;
    } else {
      //Set Location = first Parameter;
      var loc = param[1];

      //Async Weather Call
      callapi.weather(loc)
        //If we get a bad API Call or fail to process result, Log Error
        .on('error', function(err) {
          logging.error('[API] Returned ' + err);
          logging.debug('[API] Requested Location: ' + loc);
          //If a 404 API Call, give User Helpful Advice.
          if (err == 'Error: Request failed with status code 404') {
            msg.reply('I cannot find that location :face_with_spiral_eyes:');
            msg.channel.send('Maybe you used a State instead of your Country?');
          }
          //otherwise, generic error message.
          else {
            msg.reply('I\'m sorry, something went wrong. :face_with_spiral_eyes:');
          }

        })
        //On Good API Call
        .on('data', function(result) {
          //Pull Weather from Result
          var weather = result.weather[0];
          var system = result.sys;
          var ctemp = Math.round(result.main.temp - 273.15);
          var wicon = weatherjson.icon[weather.icon];

          //Format Output.
          var output = 'It is currently ' + ctemp + '°C in ' + result.name + ', :flag_'+system.country.toLowerCase()+': with ' + weather.description + ' ' + wicon;

          //Send to chat as Reply
          msg.reply(output);

          //Logg Command.
          logging.info('[CMD] '+msg.author.username+' has requested the weather for '+loc);
        });
      return;
    }
  }

  if(msg.content.startsWith(PREFIX + 'quote')) {
    callapi.quote('random')
      //If either API Call fails, or we fail to process it, send error to user and logs
      .on('error', function(err) {
        logging.error('[API] Returned ' + err);
        msg.reply('I\'m sorry, something went wrong. :face_with_spiral_eyes:');
        return;
      })
      .on('data', function(result) {
        var quote = result[0].q;
        var author = result[0].a;
        var output = '"**' + quote + '**" - *' + author + '*';
        msg.reply(output);
        //Log Command
        logging.info('[CMD] '+msg.author.username + ' asked for a quote');
        logging.debug('[REPLY] ' + output);
      });
    return;
  }

  if (msg.content.startsWith(PREFIX + 'kick')) {
    if (msg.mentions.users.size) {
      const taggedUser = msg.mentions.users.first();
      msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
      return;
    } else {
      msg.reply('Please tag a valid user!');
      return;
    }
  }
});
