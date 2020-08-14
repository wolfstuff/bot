'use strict';

const assert                = require('assert');
const { pick }              = require('utilities/src/array');
const { isDefined, isNull } = require('utilities/src/object');
const { titleCase }         = require('utilities/src/string');

/**
 * The Array of team roles supported by AwooBot.
 *
 * @type {Array.<string>}
 * @private
 */
const teams = [ 'Blue Team', 'Gold Team', 'Green Team', 'Pink Team', 'Purple Team', 'Red Team' ];

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 */

/**
 * Changes a Discord user's team role when a they enter the command `!team`.
 *
 * @param   {Message} message - The original message used to trigger this command.
 * @param   {string}  [team]  - The team to join. Optional.
 * @returns {Promise}         - A Promise for a successful response.
 * @public
 * @example
 *     team(message, 'blue');
 */
module.exports = async function team(message, team) {
    const { author, channel, guild, member } = message;
    const newTeam = await getTeam(message, team);

    if (!teams.includes(newTeam)) {
        return channel.send(`<@${ author.id }>, the \`${ newTeam }\` isn't a valid role.`);
    }

    const currentRole = getTeamRole(member);
    const joiningRole = guild.roles.cache.find((role) => role.name === newTeam);

    if (isNull(currentRole)) {
        await member.roles.add(joiningRole.id);

        return channel.send(`<@${ author.id }> joined the ${ joiningRole }!`);
    } else if (currentRole.name === newTeam) {
        return channel.send(`<@${ author.id }>, you're already on the ${ newTeam }!`);
    }

    await member.roles.remove(currentRole.id);
    await member.roles.add(joiningRole.id);

    return channel.send(`<@${ author.id }> left the ${ currentRole.name } and joined the ${ joiningRole }!`);
};

/**
 * Determines which [team] a Discord user joins. If they don't provide a team, one will be
 * randomly selected for them.
 *
 * @param   {Message} message - The original message used to trigger the change in teams.
 * @param   {string}  [team]  - The team the user wants to join. Optional.
 * @returns {string}          - A team to join.
 * @private
 * @example
 *     const team = getTeam(message, 'blue'); // 'Blue'
 */
async function getTeam(message, team) {
    const { author, channel } = message;

    if (!isDefined(team)) {
        await channel.send(`If you won't pick a team, <@${ author.id }>, then I'll pick one for you!`);
    }

    const newTeam = isDefined(team)
        ? titleCase(team)
        : pick(teams);

    return `${ newTeam } Team`;
}

/**
 * A Discord member object.
 *
 * @typedef {object} Member
 */

/**
 * Based on a given Discord message, returns the current team role associated with the Discord user
 * who sent it. If the user isn't on a team, returns `null` instead.
 *
 * @param   {Member} member - The member to fetch a team role from.
 * @returns {object|null}   - An object with the role id and name, or null.
 * @private
 * @example
 *     const currentTeam = getTeamRole(member); // 'Blue Team'
 */
function getTeamRole(member) {
    const roles = member.roles.cache.filter((role) => role.name.slice(-4) === 'Team')
        .map((role) => {
            return {
                id:   role.id,
                name: role.name
            };
        });

    assert(roles.length <= 1, 'Server members may only belong to up to one team role at a time!');

    return roles.length === 1
        ? roles[0]
        : null;
}
