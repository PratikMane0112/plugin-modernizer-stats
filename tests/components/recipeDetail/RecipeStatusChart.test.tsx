import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RecipeReport } from '../../../src/types';
import RecipeStatusChart from '../../../src/components/recipeDetail/RecipeStatusChart';

vi.mock('echarts-for-react', () => ({
  default: (props: { option: Record<string, unknown> }) => (
    <div data-testid="echarts-mock" data-option={JSON.stringify(props.option)} />
  ),
}));

const addCodeOwner: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
  totalApplications: 13,
  successCount: 11,
  failureCount: 1,
  plugins: [],
};

const setupJenkinsfile: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
  totalApplications: 624,
  successCount: 102,
  failureCount: 522,
  plugins: [],
};

const emptyRecipe: RecipeReport = {
  recipeId: 'io.jenkins.tools.pluginmodernizer.Empty',
  totalApplications: 0,
  successCount: 0,
  failureCount: 0,
  plugins: [],
};

describe('RecipeStatusChart', () => {
  it('renders the section title', () => {
    render(<RecipeStatusChart recipe={addCodeOwner} />);
    expect(screen.getByText('Application Status')).toBeDefined();
    console.log('  RecipeStatusChart : "Application Status" title rendered');
  });

  it('renders the ECharts component', () => {
    render(<RecipeStatusChart recipe={addCodeOwner} />);
    expect(screen.getByTestId('echarts-mock')).toBeDefined();
    console.log('  RecipeStatusChart : ECharts component rendered');
  });

  it('returns null when totalApplications is 0', () => {
    const { container } = render(<RecipeStatusChart recipe={emptyRecipe} />);
    expect(container.innerHTML).toBe('');
    console.log('  RecipeStatusChart : returns null for empty recipe');
  });

  it('passes real AddCodeOwner success/failure data to chart', () => {
    render(<RecipeStatusChart recipe={addCodeOwner} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    const data = option.series[0].data;
    expect(data[0].value).toBe(11);
    expect(data[0].name).toBe('Success');
    expect(data[1].value).toBe(1);
    expect(data[1].name).toBe('Failed');
    console.log('  RecipeStatusChart : AddCodeOwner chart data Success=11, Failed=1');
  });

  it('includes "Other" slice for AddCodeOwner (13 total, 11+1=12)', () => {
    render(<RecipeStatusChart recipe={addCodeOwner} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    const data = option.series[0].data;
    expect(data).toHaveLength(3);
    expect(data[2].value).toBe(1);
    expect(data[2].name).toBe('Other');
    console.log('  RecipeStatusChart : AddCodeOwner "Other" slice=1 (1 plugin with empty status)');
  });

  it('omits "Other" slice for SetupJenkinsfile (624 = 102+522)', () => {
    render(<RecipeStatusChart recipe={setupJenkinsfile} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    const data = option.series[0].data;
    expect(data).toHaveLength(2);
    expect(data[0].value).toBe(102);
    expect(data[1].value).toBe(522);
    console.log('  RecipeStatusChart : SetupJenkinsfile has no "Other" (624 = 102 + 522)');
  });

  it('uses pie chart type with donut radius', () => {
    render(<RecipeStatusChart recipe={addCodeOwner} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option')!);
    expect(option.series[0].type).toBe('pie');
    expect(option.series[0].radius).toEqual(['40%', '70%']);
    console.log('  RecipeStatusChart : pie chart with donut radius [40%, 70%]');
  });
});
