/**
 * Convenience function that checks if a value is an object.
 * @param {unknown} value - the value to check.
 * @returns {boolean} true, if the value is considered an object, false otherwise.
 */
export default function isObject(value: unknown): boolean {
  return (
    value === Object(value) &&
    !Array.isArray(value) &&
    typeof value !== 'function'
  );
}
