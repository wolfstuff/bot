'use strict';

const test       = require('ava');
const sinon      = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();

class MessageAttachmentStub {
    toString() {
        return 'MessageAttachment';
    }
};

class CanvasPlusStub {
    async load() {}
    loadFont() {}
    reset() {}
    text() {}
    async write() {}
};

const meme = proxyquire('../src/commands/meme', {
    'pixl-canvas-plus': CanvasPlusStub,
    'discord.js': {
        MessageAttachment: MessageAttachmentStub
    }
});

const author = {
    id: 'original'
};

const channel = {
    send: (str) => str
};

// #meme
test.serial('#meme: should complain if no image URL is provided', async (t) => {
    const result = await meme({ author, channel });

    t.true(result === '<@original>, please give me something to actually meme with!');
});

test.serial('#meme: should complain if no top text is provided', async (t) => {
    const result = await meme({ author, channel }, 'https://via.placeholder.com/600x600.png');

    t.true(result === '<@original>, please give me something to actually meme with!');
});

test.serial('#meme: should complain if the image URL is invalid', async (t) => {
    const result = await meme({ author, channel }, 'not a url!', 'Top Text');

    t.true(result === '<@original>, please give me something to actually meme with!');
});

test.serial('#meme: process an image with text at the top', async (t) => {
    const result = await meme({ author, channel }, 'https://via.placeholder.com/600x600.png', 'Top Text');

    t.true(result === '<@original>, here\'s that meme you ordered:');
});

test.serial('#meme: process an image with text at the top and the bottom', async (t) => {
    const result = await meme({ author, channel }, 'https://via.placeholder.com/600x600.png', 'Top Text', 'Bottom Text');

    t.true(result === '<@original>, here\'s that meme you ordered:');
});

test.serial('#meme: should complain if an error occurs', async (t) => {
    const sendStub = sinon.stub();

    sendStub.onCall(0).callsFake(() => {
        throw new Error('something went wrong!');
    });
    sendStub.onCall(1).callsFake((str) => str);

    const result = await meme({ author, channel: { send: sendStub } }, 'https://via.placeholder.com/600x600.png', 'Top Text', 'Bottom Text');

    t.true(result === 'Sorry <@original>, but I couldn\'t process your request. :c');
});
