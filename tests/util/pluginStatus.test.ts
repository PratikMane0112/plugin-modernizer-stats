import { describe, it, expect } from 'vitest';
import type { Migration } from '../../src/types';
import { deriveStatus } from '../../src/util/pluginStatus';

/**
 * Sample plugins as mock objects from https://jenkins-infra.github.io/metadata-plugin-modernizer/report.json :
 *
 * - 152 plugins: all success                          -> 'green'
 * - 205 plugins: all fail                             -> 'red'
 * -  17 mixed plugins: fail < 50%                     -> 'blue'
 * -   9 mixed plugins: fail >= 50%                    -> 'yellow'
 * -  49 plugins: any migration has missing status key -> 'white'
 *
 * No plugin has migrationStatus as empty string "".
 * 49 migrations are missing the key entirely (e.g. allure-jenkins-plugin's "Setup dependabot").
 * If any migration in a plugin has a missing migrationStatus, the whole plugin is 'white'.
 */

function makeMigration(status?: Migration['migrationStatus']): Migration {
  return {
    pluginVersion: '1.0',
    migrationName: 'test',
    migrationId: 'test.id',
    migrationStatus: status,
    key: 'k.json',
    timestamp: '2025-01-01T00-00-00',
  };
}

describe('deriveStatus', () => {
  // --- green: all migrations succeeded ---

  it('returns "green" — e.g. BlazeMeterJenkinsPlugin (2 success, 0 fail)', () => {
    const migrations = [makeMigration('success'), makeMigration('success')];
    const result = deriveStatus(migrations);
    expect(result).toBe('green');
    console.log(`  mock data : 2 success, 0 fail`);
    console.log(`  deriveStatus: "${result}"`);
  });

  // --- red: all migrations failed ---

  it('returns "red" — e.g. CustomHistory (0 success, 2 fail)', () => {
    const migrations = [makeMigration('fail'), makeMigration('fail')];
    const result = deriveStatus(migrations);
    expect(result).toBe('red');
    console.log(`  mock data : 0 success, 2 fail`);
    console.log(`  deriveStatus: "${result}"`);
  });

  // --- blue: mixed results, fail < 50% ---

  it('returns "blue" — e.g. absint-a3 (7 success, 1 fail = 12.5% fail)', () => {
    const migrations = [
      ...Array.from({ length: 7 }, () => makeMigration('success')),
      makeMigration('fail'),
    ];
    const result = deriveStatus(migrations);
    expect(result).toBe('blue');
    console.log(`  mock data : 7 success, 1 fail (12.5% fail)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  // --- yellow: mixed results, fail >= 50% ---

  it('returns "yellow" — e.g. TestFairy (2 success, 3 fail = 60% fail)', () => {
    const migrations = [
      makeMigration('success'),
      makeMigration('fail'),
      makeMigration('fail'),
      makeMigration('success'),
      makeMigration('fail'),
    ];
    const result = deriveStatus(migrations);
    expect(result).toBe('yellow');
    console.log(`  mock data : 2 success, 3 fail (60% fail)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "yellow" — e.g. kryptowire (1 success, 8 fail = 89% fail)', () => {
    const migrations = [
      makeMigration('success'),
      ...Array.from({ length: 8 }, () => makeMigration('fail')),
    ];
    const result = deriveStatus(migrations);
    expect(result).toBe('yellow');
    console.log(`  mock data : 1 success, 8 fail (89% fail)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "yellow" at exactly 50% — e.g. buildtriggerbadge (2 success, 2 fail)', () => {
    const migrations = [
      makeMigration('success'),
      makeMigration('success'),
      makeMigration('fail'),
      makeMigration('fail'),
    ];
    const result = deriveStatus(migrations);
    expect(result).toBe('yellow');
    console.log(`  mock data : 2 success, 2 fail (50% fail)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  // --- white: no migrations or any migration has missing migrationStatus ---

  it('returns "white" when migrations array is empty', () => {
    const result = deriveStatus([]);
    expect(result).toBe('white');
    console.log(`  mock data : 0 migrations (empty array)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "white" — e.g. bitbucket-filter-project-trait (1 migration, status key missing)', () => {
    const migrations = [makeMigration(undefined)];
    const result = deriveStatus(migrations);
    expect(result).toBe('white');
    console.log(`  mock data : 1 migration, status key missing`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "white" — e.g. tuleap-oauth (2 migrations, both status keys missing)', () => {
    const migrations = [makeMigration(undefined), makeMigration(undefined)];
    const result = deriveStatus(migrations);
    expect(result).toBe('white');
    console.log(`  mock data : 2 migrations, both status keys missing`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "white" — e.g. allure-jenkins-plugin (2 success + 1 missing status key)', () => {
    const migrations = [makeMigration('success'), makeMigration('success'), makeMigration(undefined)];
    const result = deriveStatus(migrations);
    expect(result).toBe('white');
    console.log(`  mock data : 2 success, 1 missing key`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "white" when fail migrations mixed with missing status key', () => {
    // no real plugin matches this today, edge-case guard for future data
    const migrations = [makeMigration('fail'), makeMigration(undefined)];
    const result = deriveStatus(migrations);
    expect(result).toBe('white');
    console.log(`  mock data : 1 fail, 1 missing key (edge-case, no real plugin today)`);
    console.log(`  deriveStatus: "${result}"`);
  });

  it('returns "white" when success, fail and missing status key are all present', () => {
    // no real plugin matches this today, edge-case guard for future data
    const migrations = [makeMigration('success'), makeMigration('fail'), makeMigration(undefined)];
    const result = deriveStatus(migrations);
    expect(result).toBe('white');
    console.log(`  mock data : 1 success, 1 fail, 1 missing key (edge-case, no real plugin today)`);
    console.log(`  deriveStatus: "${result}"`);
  });
});
