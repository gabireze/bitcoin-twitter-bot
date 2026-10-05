import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { saveImageLocally } from '../src/services/localImageService.mjs';

test('saves generated media without requiring a public domain', async () => {
  const result = await saveImageLocally(Buffer.from('domain-independent-media'), 'smoke.png');

  try {
    assert.match(result.filename, /^smoke_\d+\.png$/);
    assert.match(result.localPath, /public[\\/]images[\\/]smoke_\d+\.png$/);
    assert.equal('publicUrl' in result, false);
  } finally {
    await fs.unlink(result.localPath);
  }
});
