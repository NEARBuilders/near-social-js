// types
import type { TValue } from './types';

/**
 * Recursively transverses an object and returns the nested objects as "/" separated keys.
 * @param {Record<string, unknown>} data - the object to parse.
 * @returns {string[]} the nested objects as a set of keys.
 * @example
 *
 * input: {
 *   ['odin.test.near']: {
 *     profile: {
 *       name: 'Odin',
 *     },
 *     type: 'aesir',
 *   },
 * }
 * output: ['odin.test.near/profile/name', 'odin.test.near/type']
 */
export default function parseKeyFromData(
  data: Record<string, unknown>
): string[] {
  const parse = (keys: string[], value: TValue): string | string[] => {
    // if the value is not a nested object, we can stop recursing
    if (typeof value !== 'object') {
      return keys.join('/');
    }

    // for each nested object, recursively iterate until the value is reached
    return Object.entries(value).flatMap(([_key, _value]) =>
      parse([...keys, _key], _value as TValue)
    );
  };

  return parse([], data) as string[];
}
