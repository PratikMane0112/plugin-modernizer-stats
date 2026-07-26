import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RecipeReport } from '../../../src/types';
import RecipeTimeline from '../../../src/components/recipeDetail/RecipeTimeline';

vi.mock('echarts-for-react', () => ({
  default: (props: { option: Record<string, unknown> }) => (
    <div data-testid="echarts-mock" data-option={JSON.stringify(props.option)} />
  ),
}));

const migrateToJUnit5Plugins: RecipeReport['plugins'] = [
  { pluginName: 'pipeline-multibranch-defaults', status: 'fail', timestamp: '2025-10-05T13-47-45' },
  { pluginName: 'absint-a3', status: 'fail', timestamp: '2025-09-02T14-34-52' },
  { pluginName: 'buildtriggerbadge', status: 'fail', timestamp: '2025-07-27T16-08-02' },
  { pluginName: 'buildtriggerbadge', status: 'fail', timestamp: '2025-07-27T16-01-56' },
  { pluginName: 'custom-build-properties', status: 'success', timestamp: '2025-07-10T15-25-15' },
  { pluginName: 'pipeline-keep-running-step', status: '', timestamp: '2025-06-24T07-19-20' },
];

function recipe(plugins: RecipeReport['plugins']): RecipeReport {
  return {
    recipeId: 'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5',
    totalApplications: 6,
    successCount: plugins.filter((p) => p.status === 'success').length,
    failureCount: plugins.filter((p) => p.status === 'fail').length,
    plugins,
  };
}

describe('RecipeTimeline', () => {
  it('renders the section title', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    expect(screen.getByText('Application Timeline')).toBeDefined();
    console.log('  RecipeTimeline : "Application Timeline" title rendered');
  });

  it('renders the ECharts component', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    expect(screen.getByTestId('echarts-mock')).toBeDefined();
    console.log('  RecipeTimeline : ECharts component rendered');
  });

  it('returns null when plugins array is empty', () => {
    const { container } = render(<RecipeTimeline recipe={recipe([])} />);
    expect(container.innerHTML).toBe('');
    console.log('  RecipeTimeline : returns null for empty plugins');
  });

  it('buckets real MigrateToJUnit5 plugins by month and sorts chronologically', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    expect(option.xAxis.data).toEqual(['2025-06', '2025-07', '2025-09', '2025-10']);
    console.log('  RecipeTimeline : x-axis months [2025-06, 2025-07, 2025-09, 2025-10]');
  });

  it('computes correct success/fail counts per month from real data', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    const successSeries = option.series[0];
    const failSeries = option.series[1];
    expect(successSeries.data).toEqual([0, 1, 0, 0]);
    expect(failSeries.data).toEqual([0, 2, 1, 1]);
    console.log('  RecipeTimeline : Jun s=0/f=0, Jul s=1/f=2, Sep s=0/f=1, Oct s=0/f=1');
  });

  it('uses stacked bar chart type', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    expect(option.series[0].type).toBe('bar');
    expect(option.series[0].stack).toBe('total');
    expect(option.series[1].type).toBe('bar');
    expect(option.series[1].stack).toBe('total');
    console.log('  RecipeTimeline : stacked bar chart with stack="total"');
  });

  it('ignores pipeline-keep-running-step empty status in success/fail counts', () => {
    render(<RecipeTimeline recipe={recipe(migrateToJUnit5Plugins)} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    expect(option.series[0].data[0]).toBe(0);
    expect(option.series[1].data[0]).toBe(0);
    console.log('  RecipeTimeline : Jun (pipeline-keep-running-step, empty status) -> s=0 f=0');
  });
});
