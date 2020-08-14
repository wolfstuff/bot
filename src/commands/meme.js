'use strict';

const CanvasPlus            = require('pixl-canvas-plus');
const { MessageAttachment } = require('discord.js');
const { join }              = require('path');
const { isURL }             = require('utilities/src/string');

const canvas   = new CanvasPlus();
const fontPath = join(__dirname, '../../assets/fonts/LeagueGothic-Regular.otf');

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 */

/**
 * Responds with a rendered image attachment when a Discord user enters the command `!meme`.
 *
 * @param   {Message}   message      - The original message used to trigger this command.
 * @param   {string}    url          - The URL of an image to base the meme on.
 * @param   {string}    topText      - Text to render at the top of the image.
 * @param   {string}    [bottomText] - Text to render at the bottom of the image.
 * @returns {Promise}                - A Promise for a successful response.
 * @public
 * @example
 *     // Respond to `message` with a rendererd meme:
 *     meme(message, 'https://i.imgur.com/O9uLRFf.png', 'AwooBot is such a good boye!');
 */
module.exports = async function meme(message, url, topText, bottomText) {
    const { author, channel } = message;

    if (!url || !topText || !isURL(url)) {
        return channel.send(`<@${ author.id }>, please give me something to actually meme with!`);
    }

    try {
        const attachment = await createAttachment(canvas, url, topText, bottomText);

        return channel.send(`<@${ author.id }>, here's that meme you ordered:`, attachment);
    } catch (e) {
        canvas.reset();

        return channel.send(`Sorry <@${ author.id }>, but I couldn't process your request. :c`);
    }
};

/**
 * Creates a Discord image attachment.
 *
 * @param   {CanvasPlus} canvas       - The canvas used to render the result.
 * @param   {string}     url          - The url of the image used.
 * @param   {string}     topText      - Text displayed at the top.
 * @param   {string}     [bottomText] - Text displayed at the bottom.
 * @returns {MessageAttachment}       - A Discord image attachment.
 * @private
 * @example
 *     const attach = createAttachment(canvas, url, 'Hello', 'World');
 */
async function createAttachment(canvas, url, topText, bottomText) {
    await canvas.load(url);
    canvas.loadFont(fontPath);

    writeText(canvas, topText, 'north');

    if (bottomText) {
        writeText(canvas, bottomText, 'south');
    }

    const buffer = await canvas.write({ format: 'png' });

    canvas.reset();

    return new MessageAttachment(buffer);
}

/**
 * Renders {text} onto a given {canvas}.
 *
 * @param {CanvasPlus} canvas  - A canvas to render to.
 * @param {string}     text    - Text to render.
 * @param {string}     gravity - A cardinal direction defining where to render the text.
 * @public
 * @see https://github.com/jhuckaby/canvas-plus/#gravity
 * @example
 *     writeText(canvas, 'Hello, world!', 'south');
 */
function writeText(canvas, text, gravity) {
    canvas.text({
        'text':             text,
        'font':             fontPath,
        'size':             108,
        'color':            '#ffffff',
        'characterSpacing': 1,
        'gravity':          gravity,
        'marginX':          24,
        'marginY':          24,
        'outlineColor':     '#000000',
        'outlineThickness': 4,
        'overflow':         'shrink'
    });
}
