'use strict';

const test  = require('ava');
const sinon = require('sinon');

const team = require('../src/commands/team');

const author = {
    id: 'original'
};

const channel = {
    send: (str) => str
};

const blueTeam = { name: 'Blue Team', id: 'blueteamid', toString: () => '@Blue Team' };
const redTeam  = { name: 'Red Team',  id: 'redteamid',  toString: () => '@Red Team'  };

const guild = {
    roles: {
        cache: [ blueTeam, redTeam ]
    }
};

const member = {};

// #team
test('#team: should complain if the team chosen is not a valid role', async (t) => {
    const result = await team({ author, channel, guild, member }, 'invalid');

    t.true(result === '<@original>, the `Invalid Team` isn\'t a valid role.');
});

test('#team: should randomly pick a role if none is provided', async (t) => {
    const channelStub = {
        send: sinon.stub()
    };

    await team({ author, channel: channelStub, guild, member });

    t.true(channelStub.send.calledWith('If you won\'t pick a team, <@original>, then I\'ll pick one for you!'));
});

test('#team: should join the target team if not part of a team yet', async (t) => {
    const memberStub = {
        roles: {
            add: sinon.stub(),
            cache: []
        }
    };

    const result = await team({ author, channel, guild, member: memberStub }, 'blue');

    t.true(memberStub.roles.add.calledOnceWith('blueteamid'));
    t.true(result === '<@original> joined the @Blue Team!');
});

test('#team: should complain if already a member of a given team', async (t) => {
    const memberStub = {
        roles: {
            cache: [ blueTeam ]
        }
    };

    const result = await team({ author, channel, guild, member: memberStub }, 'blue');

    t.true(result === '<@original>, you\'re already on the Blue Team!');
});

test('#team: should leave an existing team to join the target team', async (t) => {
    const memberStub = {
        roles: {
            add: sinon.stub(),
            cache: [ redTeam ],
            remove: sinon.stub()
        }
    };

    const result = await team({ author, channel, guild, member: memberStub }, 'blue');

    t.true(memberStub.roles.remove.calledOnceWith('redteamid'));
    t.true(memberStub.roles.add.calledOnceWith('blueteamid'));
    t.true(result === '<@original> left the Red Team and joined the @Blue Team!');
});
