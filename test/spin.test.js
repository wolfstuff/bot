'use strict';

const test = require('ava');

const spin = require('../src/commands/spin');

const author = {
    id: 'original'
};

const channel = {
    send: (str) => str
};

// #spin
test('#spin: should only choose from online users who are neither bots nor the original message author', (t) => {
    const guild = {
        members: {
            cache: [
                { // The "current" user
                    presence: { status: 'online' },
                    user: { bot: false, id: author.id }
                },
                { // A bot
                    presence: { status: 'online' },
                    user: { bot: true }
                },
                { // An offline user
                    presence: { status: 'offline' },
                    user: { bot: false, id: 'offline' }
                },
                { // An online user
                    presence: { status: 'online' },
                    user: { bot: false, id: 'online' }
                }
            ]
        }
    };

    const result = spin({ author, channel, guild });

    t.true(result === '<@original> spins the bottle... and it comes to a stop pointing toward <@online>!');
});

test('#spin: should complain if there are no valid users to choose from', (t) => {
    const guild = {
        members: {
            cache: [
                { // The "current" user
                    presence: { status: 'online' },
                    user: { bot: false, id: author.id }
                },
                { // A bot
                    presence: { status: 'online' },
                    user: { bot: true }
                },
                { // An offline user
                    presence: { status: 'offline' },
                    user: { bot: false, id: 'offline' }
                }
            ]
        }
    };

    const result = spin({ author, channel, guild });

    t.true(result === '<@original> spins the bottle... but there\'s nobody else around for it to point to. :c');
});
