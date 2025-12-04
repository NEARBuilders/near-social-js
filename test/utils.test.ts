import {
  validateAccountId,
  parseKeysFromData,
  calculateSizeOfData,
  calculateRequiredDeposit,
  uniqueAccountIdsFromKeys,
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
