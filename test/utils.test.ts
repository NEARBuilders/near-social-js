import {
  validateAccountId,
  parseKeysFromData,
  calculateSizeOfData,
  calculateRequiredDeposit,
  uniqueAccountIdsFromKeys,
  extractMentions,
  extractHashtags,
  buildNotifications,
} from '../src/utils';

describe('validateAccountId', () => {
  it('should return true for valid account IDs', () => {
    expect(validateAccountId('alice.near')).toBe(true);
    expect(validateAccountId('bob.testnet')).toBe(true);
    expect(validateAccountId('aa')).toBe(true);
    expect(validateAccountId('a-b.near')).toBe(true);
    expect(validateAccountId('a_b.near')).toBe(true);
    expect(validateAccountId('sub.account.near')).toBe(true);
    expect(validateAccountId('123.near')).toBe(true);
    expect(validateAccountId('a'.repeat(64))).toBe(true);
  });

  it('should return false for invalid account IDs', () => {
    expect(validateAccountId('a')).toBe(false);
    expect(validateAccountId('a'.repeat(65))).toBe(false);
    expect(validateAccountId('ALICE.near')).toBe(false);
    expect(validateAccountId('alice..near')).toBe(false);
    expect(validateAccountId('.alice.near')).toBe(false);
    expect(validateAccountId('alice.near.')).toBe(false);
    expect(validateAccountId('alice@near')).toBe(false);
    expect(validateAccountId('')).toBe(false);
  });
});

describe('parseKeysFromData', () => {
  it('should parse flat object keys', () => {
    const data = {
      alice: {
        profile: 'value',
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toEqual(['alice/profile']);
  });

  it('should parse nested object keys', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
          bio: 'Hello',
        },
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toContain('alice/profile/name');
    expect(keys).toContain('alice/profile/bio');
    expect(keys).toHaveLength(2);
  });

  it('should handle multiple accounts', () => {
    const data = {
      alice: {
        profile: 'value1',
      },
      bob: {
        profile: 'value2',
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toContain('alice/profile');
    expect(keys).toContain('bob/profile');
    expect(keys).toHaveLength(2);
  });

  it('should handle deeply nested structures', () => {
    const data = {
      alice: {
        graph: {
          follow: {
            bob: '',
          },
        },
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toEqual(['alice/graph/follow/bob']);
  });

  it('should handle null values for deleting keys', () => {
    const data = {
      alice: {
        profile: {
          bio: null,
        },
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toEqual(['alice/profile/bio']);
  });

  it('should handle mixed null and string values', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
          bio: null,
        },
      },
    };
    const keys = parseKeysFromData(data);
    expect(keys).toContain('alice/profile/name');
    expect(keys).toContain('alice/profile/bio');
    expect(keys).toHaveLength(2);
  });
});

describe('calculateSizeOfData', () => {
  it('should calculate size for simple string value', () => {
    const data = {
      alice: {
        profile: 'hello',
      },
    };
    const size = calculateSizeOfData(data);
    expect(size).toBeGreaterThan(0n);
  });

  it('should calculate larger size for longer strings', () => {
    const smallData = { alice: { profile: 'hi' } };
    const largeData = {
      alice: { profile: 'hello world this is a longer string' },
    };

    const smallSize = calculateSizeOfData(smallData);
    const largeSize = calculateSizeOfData(largeData);

    expect(largeSize).toBeGreaterThan(smallSize);
  });

  it('should calculate size for nested objects', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
          bio: 'Developer',
        },
      },
    };
    const size = calculateSizeOfData(data);
    expect(size).toBeGreaterThan(0n);
  });
});

describe('calculateRequiredDeposit', () => {
  it('should calculate deposit for new account (no storage balance)', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
        },
      },
    };
    const deposit = calculateRequiredDeposit({ data, storageBalance: null });
    expect(deposit.isGreaterThan(0)).toBe(true);
  });

  it('should return zero when storage balance covers the cost', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
        },
      },
    };
    const deposit = calculateRequiredDeposit({
      data,
      storageBalance: {
        available: 10000000000000000000000000n,
        total: 10000000000000000000000000n,
      },
    });
    expect(deposit.isEqualTo(0)).toBe(true);
  });

  it('should calculate partial deposit when storage balance is insufficient', () => {
    const data = {
      alice: {
        profile: {
          name: 'Alice',
          bio: 'This is a longer bio that requires more storage',
        },
      },
    };
    const fullDeposit = calculateRequiredDeposit({
      data,
      storageBalance: null,
    });
    const partialDeposit = calculateRequiredDeposit({
      data,
      storageBalance: {
        available: 1000000000000000000000n,
        total: 1000000000000000000000n,
      },
    });

    expect(partialDeposit.isLessThan(fullDeposit)).toBe(true);
    expect(partialDeposit.isGreaterThan(0)).toBe(true);
  });
});

describe('uniqueAccountIdsFromKeys', () => {
  it('should extract unique account IDs from keys', () => {
    const keys = ['alice/profile', 'bob/profile', 'alice/settings'];
    const accountIds = uniqueAccountIdsFromKeys(keys);
    expect(accountIds).toContain('alice');
    expect(accountIds).toContain('bob');
    expect(accountIds).toHaveLength(2);
  });

  it('should handle single account', () => {
    const keys = ['alice/profile', 'alice/settings', 'alice/graph/follow/bob'];
    const accountIds = uniqueAccountIdsFromKeys(keys);
    expect(accountIds).toEqual(['alice']);
  });

  it('should return empty array for empty input', () => {
    const accountIds = uniqueAccountIdsFromKeys([]);
    expect(accountIds).toEqual([]);
  });

  it('should handle keys without slashes', () => {
    const keys = ['alice'];
    const accountIds = uniqueAccountIdsFromKeys(keys);
    expect(accountIds).toEqual(['alice']);
  });
});

describe('extractMentions', () => {
  it('should extract single mention', () => {
    const text = 'Hello @alice.near how are you?';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['alice.near']);
  });

  it('should extract multiple mentions', () => {
    const text = 'Hey @alice.near and @bob.testnet, check this out!';
    const mentions = extractMentions(text);
    expect(mentions).toContain('alice.near');
    expect(mentions).toContain('bob.testnet');
    expect(mentions).toHaveLength(2);
  });

  it('should return unique mentions only', () => {
    const text = '@alice.near said hello to @alice.near';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['alice.near']);
  });

  it('should handle mentions without .near suffix', () => {
    const text = 'Hello @alice and @bob123';
    const mentions = extractMentions(text);
    expect(mentions).toContain('alice');
    expect(mentions).toContain('bob123');
  });

  it('should return empty array for text without mentions', () => {
    const text = 'Hello world, no mentions here!';
    const mentions = extractMentions(text);
    expect(mentions).toEqual([]);
  });

  it('should handle mentions at start and end of text', () => {
    const text = '@alice.near is cool @bob.near';
    const mentions = extractMentions(text);
    expect(mentions).toContain('alice.near');
    expect(mentions).toContain('bob.near');
  });

  it('should filter out invalid account IDs', () => {
    const text = 'Hello @a (too short) and @alice.near (valid)';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['alice.near']);
  });

  it('should handle subaccounts', () => {
    const text = 'Check out @sub.account.near';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['sub.account.near']);
  });

  it('should convert mentions to lowercase', () => {
    const text = 'Hello @ALICE.NEAR';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['alice.near']);
  });
});

describe('extractHashtags', () => {
  it('should extract single hashtag', () => {
    const text = 'This is #awesome content';
    const hashtags = extractHashtags(text);
    expect(hashtags).toEqual(['awesome']);
  });

  it('should extract multiple hashtags', () => {
    const text = 'Check out #near #blockchain #web3';
    const hashtags = extractHashtags(text);
    expect(hashtags).toContain('near');
    expect(hashtags).toContain('blockchain');
    expect(hashtags).toContain('web3');
    expect(hashtags).toHaveLength(3);
  });

  it('should return unique hashtags only', () => {
    const text = '#near is great #near is awesome';
    const hashtags = extractHashtags(text);
    expect(hashtags).toEqual(['near']);
  });

  it('should return empty array for text without hashtags', () => {
    const text = 'Hello world, no hashtags here!';
    const hashtags = extractHashtags(text);
    expect(hashtags).toEqual([]);
  });

  it('should handle hashtags with numbers', () => {
    const text = 'Check out #web3 and #near2024';
    const hashtags = extractHashtags(text);
    expect(hashtags).toContain('web3');
    expect(hashtags).toContain('near2024');
  });

  it('should handle hashtags with underscores', () => {
    const text = 'Welcome to #near_protocol';
    const hashtags = extractHashtags(text);
    expect(hashtags).toEqual(['near_protocol']);
  });

  it('should not extract hashtags starting with numbers', () => {
    const text = 'This is #123invalid but #valid123 is ok';
    const hashtags = extractHashtags(text);
    expect(hashtags).toEqual(['valid123']);
  });

  it('should convert hashtags to lowercase', () => {
    const text = 'Check out #NEAR and #Blockchain';
    const hashtags = extractHashtags(text);
    expect(hashtags).toContain('near');
    expect(hashtags).toContain('blockchain');
  });

  it('should handle hashtags at start and end of text', () => {
    const text = '#start and #end';
    const hashtags = extractHashtags(text);
    expect(hashtags).toContain('start');
    expect(hashtags).toContain('end');
  });
});

describe('buildNotifications', () => {
  const testItem = {
    type: 'social',
    path: 'poster.near/post/main',
    blockHeight: 12345,
  };

  it('should build notification for single mention', () => {
    const mentions = ['alice.near'];
    const result = buildNotifications(mentions, testItem);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('notify');

    const parsed = JSON.parse(result!.notify);
    expect(parsed.key).toBe('alice.near');
    expect(parsed.value.type).toBe('mention');
    expect(parsed.value.item).toEqual(testItem);
  });

  it('should build notifications for multiple mentions', () => {
    const mentions = ['alice.near', 'bob.near'];
    const result = buildNotifications(mentions, testItem);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('notify');

    const parsed = JSON.parse(result!.notify);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].key).toBe('alice.near');
    expect(parsed[1].key).toBe('bob.near');
  });

  it('should return null for empty mentions array', () => {
    const mentions: string[] = [];
    const result = buildNotifications(mentions, testItem);
    expect(result).toBeNull();
  });

  it('should include correct item reference in notifications', () => {
    const mentions = ['alice.near'];
    const customItem = {
      type: 'social',
      path: 'bob.near/post/main',
      blockHeight: 99999,
    };
    const result = buildNotifications(mentions, customItem);

    const parsed = JSON.parse(result!.notify);
    expect(parsed.value.item).toEqual(customItem);
  });
});
