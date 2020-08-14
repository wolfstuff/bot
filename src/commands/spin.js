'use strict';

const { pick } = require('utilities/src/array');

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 */

/**
 * Responds by tagging another random online user when a Discord user enters the command `!spin`.
 *
 * @param   {Message} message - The original message used to trigger this command.
 * @returns {Promise}         - A Promise for a successful response.
 * @public
 * @example
 *     // Tag another random online user:
 *     spin(message);
 */
module.exports = function spin(message) {
    const { author, channel, guild } = message;

    const online = guild.members.cache.filter((member) => {
        return member.presence.status === 'online'
            && !member.user.bot
            && member.user.id !== author.id;
    }).map((member) => {
        return {
            id:   member.user.id,
            name: member.user.username
        };
    });

    if (online.length === 0) {
        const reply = `<@${ author.id }> spins the bottle... but there's nobody else around for it to point to. :c`;

        return channel.send(reply);
    }

    const choice = pick(online);
    const reply  = `<@${ author.id }> spins the bottle... and it comes to a stop pointing toward <@${ choice.id }>!`;

    return channel.send(reply);
};
