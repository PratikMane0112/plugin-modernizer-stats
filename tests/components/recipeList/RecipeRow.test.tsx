import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RecipeReport } from '../../../src/types';
import RecipeRow from '../../../src/components/recipeList/RecipeRow';
import { shortRecipeName, getRateTier, computeSuccessRate } from '../../../src/util/recipeStatus';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const TIER_LABELS: Record<ReturnType<typeof getRateTier>, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function pluginEntry(name: string, status: string, ts: string) {
  return { pluginName: name, status, timestamp: ts };
}

function recipe(
  recipeId: string,
  successCount: number,
  failureCount: number,
  plugins: RecipeReport['plugins'] = []
): RecipeReport {
  const totalApplications = successCount + failureCount;
  return {
    recipeId,
    totalApplications,
    successCount,
    failureCount,
    plugins,
  };
}

const highRateRecipe = recipe('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile', 95, 5, [
  pluginEntry('BlazeMeterJenkinsPlugin', 'success', '2025-09-03T08-05-48'),
  pluginEntry('CustomHistory', 'fail', '2025-09-03T08-08-19'),
]);
const mediumRateRecipe = recipe('io.jenkins.tools.pluginmodernizer.AddCodeOwner', 35, 15, [
  pluginEntry('ec2-fleet', 'success', '2025-07-29T16-31-26'),
  pluginEntry('syslog-logger', 'fail', '2025-07-07T08-14-40'),
  pluginEntry('pipeline-keep-running-step', '', '2025-06-24T07-19-20'),
]);
const lowRateRecipe = recipe('io.jenkins.tools.pluginmodernizer.MigrateToJUnit5', 10, 40, [
  pluginEntry('TestFairy', 'fail', '2025-09-03T08-13-07'),
]);
const noDataRecipe = recipe('io.jenkins.tools.pluginmodernizer.FixJellyIssues', 0, 0);

const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: 72 };

function renderRow(r: RecipeReport) {
  return render(
    <MemoryRouter>
      <RecipeRow recipe={r} style={style} />
    </MemoryRouter>
  );
}

function expectedBadgeText(r: RecipeReport): string {
  const rate = computeSuccessRate(r);
  const tier = getRateTier(rate);
  return `${TIER_LABELS[tier]} (${rate.toFixed(1)}%)`;
}

function rowText(r: RecipeReport): string {
  const name = shortRecipeName(r.recipeId);
  const row = screen.getByText(name).closest('[style]');
  return row!.textContent ?? '';
}

describe('RecipeRow — highRateRecipe', () => {
  it('displays the short recipe name', () => {
    renderRow(highRateRecipe);
    const expected = shortRecipeName(highRateRecipe.recipeId);
    expect(screen.getByText(expected)).toBeDefined();
    console.log(`  mock data  : recipeId="${highRateRecipe.recipeId}"`);
    console.log(`  RecipeRow  : short name "${expected}" rendered`);
  });

  it('renders SuccessRateBadge with high tier', () => {
    renderRow(highRateRecipe);
    const badge = expectedBadgeText(highRateRecipe);
    expect(screen.getByText(badge)).toBeDefined();
    const rate = computeSuccessRate(highRateRecipe);
    console.log(`  mock data  : successRate=${rate} -> tier="${getRateTier(rate)}"`);

    console.log(`  RecipeRow  : SuccessRateBadge shows "${badge}"`);
  });

  it('shows success count and total applications', () => {
    renderRow(highRateRecipe);
    const text = rowText(highRateRecipe);
    expect(text).toContain(String(highRateRecipe.successCount));
    expect(text).toContain(`/${highRateRecipe.totalApplications}`);
    console.log(
      `  mock data  : successCount=${highRateRecipe.successCount}, totalApplications=${highRateRecipe.totalApplications}`
    );
    console.log(`  RecipeRow  : "${highRateRecipe.successCount}/${highRateRecipe.totalApplications}" rendered`);
  });

  it('shows failure count with label', () => {
    renderRow(highRateRecipe);
    const text = rowText(highRateRecipe);
    expect(text).toContain(String(highRateRecipe.failureCount));
    expect(text).toContain('fail');
    console.log(`  mock data  : failureCount=${highRateRecipe.failureCount}`);
    console.log(`  RecipeRow  : "${highRateRecipe.failureCount} fail" rendered`);
  });
});

describe('RecipeRow — mediumRateRecipe', () => {
  it('displays the short recipe name', () => {
    renderRow(mediumRateRecipe);
    const expected = shortRecipeName(mediumRateRecipe.recipeId);
    expect(screen.getByText(expected)).toBeDefined();
    console.log(`  mock data  : recipeId="${mediumRateRecipe.recipeId}"`);
    console.log(`  RecipeRow  : short name "${expected}" rendered`);
  });

  it('renders SuccessRateBadge with medium tier', () => {
    renderRow(mediumRateRecipe);
    const badge = expectedBadgeText(mediumRateRecipe);
    expect(screen.getByText(badge)).toBeDefined();
    const rate = computeSuccessRate(mediumRateRecipe);
    console.log(`  mock data  : successRate=${rate} -> tier="${getRateTier(rate)}"`);

    console.log(`  RecipeRow  : SuccessRateBadge shows "${badge}"`);
  });

  it('shows success count and total applications', () => {
    renderRow(mediumRateRecipe);
    const text = rowText(mediumRateRecipe);
    expect(text).toContain(String(mediumRateRecipe.successCount));
    expect(text).toContain(`/${mediumRateRecipe.totalApplications}`);
    console.log(
      `  mock data  : successCount=${mediumRateRecipe.successCount}, totalApplications=${mediumRateRecipe.totalApplications}`
    );
    console.log(`  RecipeRow  : "${mediumRateRecipe.successCount}/${mediumRateRecipe.totalApplications}" rendered`);
  });

  it('shows failure count with label', () => {
    renderRow(mediumRateRecipe);
    const text = rowText(mediumRateRecipe);
    expect(text).toContain(String(mediumRateRecipe.failureCount));
    expect(text).toContain('fail');
    console.log(`  mock data  : failureCount=${mediumRateRecipe.failureCount}`);
    console.log(`  RecipeRow  : "${mediumRateRecipe.failureCount} fail" rendered`);
  });
});

describe('RecipeRow — lowRateRecipe', () => {
  it('displays the short recipe name', () => {
    renderRow(lowRateRecipe);
    const expected = shortRecipeName(lowRateRecipe.recipeId);
    expect(screen.getByText(expected)).toBeDefined();
    console.log(`  mock data  : recipeId="${lowRateRecipe.recipeId}"`);
    console.log(`  RecipeRow  : short name "${expected}" rendered`);
  });

  it('renders SuccessRateBadge with low tier', () => {
    renderRow(lowRateRecipe);
    const badge = expectedBadgeText(lowRateRecipe);
    expect(screen.getByText(badge)).toBeDefined();
    const rate = computeSuccessRate(lowRateRecipe);
    console.log(`  mock data  : successRate=${rate} -> tier="${getRateTier(rate)}"`);

    console.log(`  RecipeRow  : SuccessRateBadge shows "${badge}"`);
  });

  it('shows success count and total applications', () => {
    renderRow(lowRateRecipe);
    const text = rowText(lowRateRecipe);
    expect(text).toContain(String(lowRateRecipe.successCount));
    expect(text).toContain(`/${lowRateRecipe.totalApplications}`);
    console.log(
      `  mock data  : successCount=${lowRateRecipe.successCount}, totalApplications=${lowRateRecipe.totalApplications}`
    );
    console.log(`  RecipeRow  : "${lowRateRecipe.successCount}/${lowRateRecipe.totalApplications}" rendered`);
  });

  it('shows failure count with label', () => {
    renderRow(lowRateRecipe);
    const text = rowText(lowRateRecipe);
    expect(text).toContain(String(lowRateRecipe.failureCount));
    expect(text).toContain('fail');
    console.log(`  mock data  : failureCount=${lowRateRecipe.failureCount}`);
    console.log(`  RecipeRow  : "${lowRateRecipe.failureCount} fail" rendered`);
  });
});

describe('RecipeRow — noDataRecipe', () => {
  it('displays the short recipe name', () => {
    renderRow(noDataRecipe);
    const expected = shortRecipeName(noDataRecipe.recipeId);
    expect(screen.getByText(expected)).toBeDefined();
    console.log(`  mock data  : recipeId="${noDataRecipe.recipeId}"`);
    console.log(`  RecipeRow  : short name "${expected}" rendered`);
  });

  it('renders SuccessRateBadge with low tier', () => {
    renderRow(noDataRecipe);
    const badge = expectedBadgeText(noDataRecipe);
    expect(screen.getByText(badge)).toBeDefined();
    const rate = computeSuccessRate(noDataRecipe);
    console.log(`  mock data  : successRate=${rate} -> tier="${getRateTier(rate)}"`);

    console.log(`  RecipeRow  : SuccessRateBadge shows "${badge}"`);
  });

  it('shows zero counts', () => {
    renderRow(noDataRecipe);
    const text = rowText(noDataRecipe);
    expect(text).toContain(`/${noDataRecipe.totalApplications}`);
    console.log(
      `  mock data  : successCount=${noDataRecipe.successCount}, totalApplications=${noDataRecipe.totalApplications}`
    );
    console.log(`  RecipeRow  : zero counts rendered`);
  });

  it('has title attribute with full recipe ID for tooltip', () => {
    renderRow(noDataRecipe);
    const nameEl = screen.getByText(shortRecipeName(noDataRecipe.recipeId));
    expect(nameEl.getAttribute('title')).toBe(noDataRecipe.recipeId);
    console.log(`  RecipeRow  : title="${noDataRecipe.recipeId}"`);
  });
});

describe('RecipeRow — general', () => {
  it('navigates to recipe detail page on click', () => {
    mockNavigate.mockClear();
    const { container } = renderRow(lowRateRecipe);
    const row = container.firstChild as HTMLElement;
    fireEvent.click(row);
    const expectedPath = `/recipes/${encodeURIComponent(lowRateRecipe.recipeId)}`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
    console.log(`  mock data  : clicked row for "${shortRecipeName(lowRateRecipe.recipeId)}"`);
    console.log(`  RecipeRow  : navigated to "${expectedPath}"`);
  });

  it('navigates on Enter key press', () => {
    mockNavigate.mockClear();
    const { container } = renderRow(highRateRecipe);
    const row = container.firstChild as HTMLElement;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${encodeURIComponent(highRateRecipe.recipeId)}`);
    console.log(`  RecipeRow  : Enter key triggers navigation`);
  });

  it('navigates on Space key press', () => {
    mockNavigate.mockClear();
    const { container } = renderRow(mediumRateRecipe);
    const row = container.firstChild as HTMLElement;
    fireEvent.keyDown(row, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${encodeURIComponent(mediumRateRecipe.recipeId)}`);
    console.log(`  RecipeRow  : Space key triggers navigation`);
  });

  it('renders ChevronRight navigate arrow icon', () => {
    const { container } = renderRow(noDataRecipe);
    const svgIcons = container.querySelectorAll('svg[data-testid="ChevronRightIcon"]');
    expect(svgIcons.length).toBe(1);
    console.log(`  RecipeRow  : ChevronRight navigate arrow present`);
  });

  it('self-consistent mock: computeSuccessRate matches successCount / totalApplications', () => {
    for (const r of [highRateRecipe, mediumRateRecipe, lowRateRecipe, noDataRecipe]) {
      const expected = r.totalApplications > 0 ? (r.successCount / r.totalApplications) * 100 : 0;
      expect(computeSuccessRate(r)).toBeCloseTo(expected, 5);
    }
    console.log(`  RecipeRow  : all 4 mocks have self-consistent computeSuccessRate`);
  });
});
