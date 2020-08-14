'use strict';

const { array }                  = require('utilities/src/array');
const { assign, isNull, object } = require('utilities/src/object');
const { range }                  = require('utilities/src/random');

const max_num   = 20;
const max_sides = 100;

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 */

/**
 * Responds by rolling dice when a Discord user enters the command `!roll`.
 *
 * @param   {Message}        message  - The original message used to trigger this command.
 * @param   {string}         diceStr  - A string of text in traditional dice notation.
 * @param   {Array.<string>} [reason] - Text to render at the bottom of the image.
 * @returns {Promise}                 - A Promise for a successful response.
 * @public
 * @example
 *     dice(message, '3d6', 'rolling for stats');
 */
module.exports = async function roll(message, diceStr, ...reason) {
    const { author, channel } = message;
    const parsed = await parseRoll(message, diceStr);

    if (isNull(parsed)) {
        // The diceStr could not be parsed; do nothing:
        return;
    }

    const { num, sides, modifier } = parsed;
    const results = stringify(num, sides, modifier, diceStr, reason.join(' '));

    return channel.send(`<@${ author.id }> ${ results }`);
};

const dice_expr = /(?<num>\d+)d(?<sides>\d+)(?<modifier>[+-]\d+)?/u;

/**
 * Parses a given {diceStr} into usable data, if possible. If not, returns `null`.
 *
 * @param   {Message} message - The original message used to trigger this command.
 * @param   {string}  str     - A string of text in traditional dice notation.
 * @returns {object|null}     - Roll information if successful, null if not.
 * @private
 * @example
 *     const roll1 = parseRoll(message, '3d6'); // { num: 3, sides: 6, modifier: 0 }
 *     const roll2 = parseRoll(message, '2d10-1'); // { num: 2, sides: 10, modifier: -1 }
 *     const roll3 = parseRoll(message, 'Hello, world!'); // null
 */
async function parseRoll(message, str) {
    const { author, channel } = message;
    const matched = str.match(dice_expr);

    if (!matched) {
        await channel.send(`<@${ author.id }>, I can't parse the string \`${ str }\` as a dice roll!`);

        return null;
    }

    const groups   = assign(object(), matched.groups);
    const num      = parseInt(groups.num, 10);
    const sides    = parseInt(groups.sides, 10);
    const modifier = parseInt(groups.modifier || 0, 10);

    return checkRollParams(message, num, sides, modifier);
}

/**
 * Checks roll parameters to ensure they're within logical bounds. Returns usable data, if
 * posisble. If not, returns `null`.
 *
 * @param   {Message} message  - The original message used to trigger this command.
 * @param   {number}  num      - The number of dice rolled.
 * @param   {number}  sides    - The number of sides on each dice.
 * @param   {number}  modifier - The roll modifier.
 * @returns {object|null}      - Roll information if successful, null if not.
 * @private
 * @example
 *     checkRollParams(message, 3, 6, 0); // { num: 3, sides: 6, modifier: 0 }
 *     checkRollParams(message, -1, 6, 0); // null
 *     checkRollParams(message, 3, -1, 0); // null
 */
async function checkRollParams(message, num, sides, modifier) {
    const { author, channel } = message;

    if (num <= 0 || sides <= 0) {
        await channel.send(`<@${ author.id }>, please don't make me do math that involves non-Euclidean geometry!`);

        return null;
    } else if (num > max_num) {
        await channel.send(`<@${ author.id }>, please roll fewer dice!`);

        return null;
    } else if (sides > max_sides) {
        await channel.send(`<@${ author.id }>, please roll dice with fewer sides!`);

        return null;
    }

    return { num, sides, modifier };
}

/**
 * Rolls dice and returns a text summary of the results.
 *
 * @param   {number}         num        - The number of dice rolled.
 * @param   {number}         sides      - The number of sides on each dice.
 * @param   {number}         modifier   - The roll modifier.
 * @param   {string}         diceStr    - The original dice string used for the roll.
 * @param   {Array.<string>} [reason]   - The reason the roll was made. Optional.
 * @returns {string}                    - A text summary of the dice roll.
 * @private
 * @example
 *     stringify(3, 6, 0, '3d6'); // 'rolled 3d6: **18**\r\n_Results:_ `[ 6, 6, 6 ] = 18`'
 */
function stringify(num, sides, modifier, diceStr, reason) {
    const rolls  = array(num).map(() => range(1, sides));
    const total  = rolls.reduce((sum, each) => sum + each, modifier);
    const modStr = modifierToString(modifier);

    let result = `rolled ${ diceStr }: **${ total }**`;
    result = `${ result }\r\n_Results:_ \`[ ${ rolls.join(' + ') } ]${ modStr } = ${ total }\``;

    if (reason) {
        result = `${ result }\r\n_Reason:_ ${ reason }`;
    }

    return result;
}

/**
 * Converts a dice {modifier} to a string.
 *
 * @param   {number} modifier - A dice modifier.
 * @returns {string}          - The {modifier} as a string.
 * @private
 * @example
 *     modifierToString(0); // ''
 *     modifierToString(-1); // ' - 1'
 *     modifierToString(1); // ' + 1'
 */
function modifierToString(modifier) {
    const mod = Math.abs(modifier).toString();

    if (modifier > 0) {
        return ` + ${ mod }`;
    } else if (modifier < 0) {
        return ` - ${ mod }`;
    }

    return '';
}
