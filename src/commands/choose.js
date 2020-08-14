'use strict';

const { pick } = require('utilities/src/array');

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 */

/**
 * Responds with a random choice from a list of {options} when a Discord user enters the
 * command `!choose`.
 *
 * @param   {Message}   message - The original message used to trigger this command.
 * @param   {...string} options - An Array of options to choose from.
 * @returns {Promise}           - A Promise for a successful response.
 * @public
 * @example
 *     // Respond to `message` with one of the other arguments at random:
 *     choose(message, 'first', 'second', 'third');
 */
module.exports = function choose(message, ...options) {
    const { author, channel } = message;
    const { id }  = author;

    if (options.length <= 1) {
        return channel.send(`<@${ id }>, you've got to give me some options to choose _from!_`);
    }

    return channel.send(reply(id, pick(options)));
};

/**
 * Selects a randomly worded phrasing to inform a Discord user with a given {id}
 * which {choice} the bot made for them.
 *
 * @param   {string} id     - The Discord user id to reply to.
 * @param   {string} choice - The choice that was made.
 * @returns {string}        - Randomly worded informative phrasing.
 * @private
 * @example
 *     reply('1', 'choice'); // replies to Discord user id 1 with 'choice'
 */
function reply(id, choice) {
    const replies = [
        `Not that I'm an expert, <@${ id }>, but maybe try \`${ choice }\`?`,
        `<@${ id }>, all things being equal, I'd have to go with \`${ choice }\`.`,
        `I dunno... \`${ choice }\`? Is that a good call, <@${ id }>?`,
        `You might hate me for this, <@${ id }>, but I pick \`${ choice }\`!`
    ];

    return pick(replies);
}
