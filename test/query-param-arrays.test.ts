import { describe, it, expect } from 'vitest';

/**
 * Isolated unit tests for query parameter serialization of primitive array values.
 */

function serializeArrayQuery(key: string, values: (string | number | boolean)[]): string {
  if (!values || values.length === 0) return '';
  return values.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join('&');
}

describe('Query Parameter Array Formatting', () => {
  it('should serialize string arrays into repeated key pairs', () => {
    expect(serializeArrayQuery('tag', ['alpha', 'beta'])).toBe('tag=alpha&tag=beta');
  });

  it('should serialize numeric arrays accurately', () => {
    expect(serializeArrayQuery('id', [101, 202, 303])).toBe('id=101&id=202&id=303');
  });

  it('should handle empty array inputs gracefully', () => {
    expect(serializeArrayQuery('empty', [])).toBe('');
  });
});
