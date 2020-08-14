'use strict';

const { join }          = require('path');
const { Client }        = require('discord.js');
const parser            = require('cmd-parser');
const { loadDirectory } = require('utilities/src/load');

const commands = loadDirectory(join(__dirname, './commands'));
const awoobot  = new Client();

awoobot.on('message', parser(commands));

awoobot.on('ready', () => {
    console.log('AwooBot, reporting for duty! Awooooo~!');
});

awoobot.login(process.env.DISCORD_BOT_TOKEN);
