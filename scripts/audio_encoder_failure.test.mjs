import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodePcmToOggOpus, convertAudioBlobToOggOpus } from '../src/lib/utils/audioEncoder.js';

// Node has neither browser Workers nor AudioContext. Verify real capability
// failures reject rather than return a fabricated, silent recording.
test('missing Worker does not produce a fake voice recording', async () => {
  assert.equal(typeof Worker, 'undefined');
  await assert.rejects(encodePcmToOggOpus(new Float32Array(960)), /Web Worker/);
});

test('missing AudioContext does not replace the original recording with silence', async () => {
  await assert.rejects(convertAudioBlobToOggOpus(new Blob(['original recording'])), /AudioContext/);
});
