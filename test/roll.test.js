'use strict';

const test  = require('ava');
const sinon = require('sinon');

const roll = require('../src/commands/roll');

const author = {
    id: 'original'
};

const channel = {
    send: sinon.stub().callsFake((str) => str)
};

test.afterEach(() => {
    channel.send.resetHistory();
});

// #roll
test.serial('#roll: should warn the user if the dice string cannot be parsed', async (t) => {
    const result = await roll({ author, channel }, 'not valid');

    t.true(channel.send.calledOnce, 'Did not warn the user!');
    t.true(result === undefined, 'Did not do nothing!');
});

test.serial('#roll: should roll a random number', async (t) => {
    const result = await roll({ author, channel }, '1d1');

    t.true(channel.send.calledOnce, 'Did not report the result!');
    t.true(result.includes('`[ 1 ] = 1`'), 'Did not roll a random number!');
});

test.serial('#roll: should warn the user if 0 or fewer dice are used and return nothing', async (t) => {
    const result = await roll({ author, channel }, '0d6');

    t.true(channel.send.calledOnce, 'Did not warn the user!');
    t.true(result === undefined, 'Did not return nothing!');
});

test.serial('#roll: should warn the user if dice with 0 or fewer sides are used and return nothing', async (t) => {
    const result = await roll({ author, channel }, '1d0');

    t.true(channel.send.calledOnce, 'Did not warn the user!');
    t.true(result === undefined, 'Did not return nothing!');
});

test.serial('#roll: should warn the user if more than 20 dice are used and return nothing', async (t) => {
    const result = await roll({ author, channel }, '21d6');

    t.true(channel.send.calledOnce, 'Did not warn the user!');
    t.true(result === undefined, 'Did not return nothing!');
});

test.serial('#roll: should warn the user if dice with more than 100 sides are used and return nothing', async (t) => {
    const result = await roll({ author, channel }, '3d101');

    t.true(channel.send.calledOnce, 'Did not warn the user!');
    t.true(result === undefined, 'Did not return nothing!');
});

test.serial('#roll: should mention the reason the dice were rolled, if provided', async (t) => {
    const result = await roll({ author, channel }, '3d6', 'reason');

    t.true(channel.send.calledOnce, 'Did not report the result!');
    t.true(result.includes('reason'), 'Did not mention a reason!');
});

test.serial('#roll: should include positive modifiers, if provided', async (t) => {
    const result = await roll({ author, channel }, '3d6+21');

    t.true(channel.send.calledOnce, 'Did not report the result!');
    t.true(result.includes('+ 21'), 'Did not include a positive modifier!');
});

test.serial('#roll: should include negative modifiers, if provided', async (t) => {
    const result = await roll({ author, channel }, '3d6-21');

    t.true(channel.send.calledOnce, 'Did not report the result!');
    t.true(result.includes('- 21'), 'Did not include a negative modifier!');
});
