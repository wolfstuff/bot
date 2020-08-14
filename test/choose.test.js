'use strict';

const test = require('ava');

const choose = require('../src/commands/choose');

const author = {
    id: 'original'
};

const channel = {
    send: (str) => str
};

// #choose
test('#choose: should complain if one or fewer options are provided', (t) => {
    const result = choose({ author, channel });

    t.true(result === '<@original>, you\'ve got to give me some options to choose _from!_', 'Did not complain about too few options!');
});

test('#choose: should choose an option at random', (t) => {
    const result = choose({ author, channel }, 'option', 'option');

    t.true(result.includes('option'), 'Did not choose an option at random!');
});
