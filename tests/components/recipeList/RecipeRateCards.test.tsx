import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { RateTier } from '../../../src/util/recipeStatus';
import RecipeRateCards from '../../../src/components/recipeList/RecipeRateCards';

const tierCounts: Record<RateTier, number> = { high: 10, medium: 5, low: 3, none: 2 };

describe('RecipeRateCards', () => {
  it('renders all four tier cards with correct counts', () => {
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={() => {}} />);
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    console.log(`  RecipeRateCards : all four tier counts rendered (10, 5, 3, 2)`);
  });

  it('renders tier labels', () => {
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={() => {}} />);
    expect(screen.getByText('High Rate')).toBeDefined();
    expect(screen.getByText('Medium Rate')).toBeDefined();
    expect(screen.getByText('Low Rate')).toBeDefined();
    expect(screen.getByText('No Data')).toBeDefined();
    console.log(`  RecipeRateCards : all four tier labels rendered`);
  });

  it('calls onFilterChange when a card is clicked', () => {
    const onChange = vi.fn();
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="all" onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('High Rate'));
    expect(onChange).toHaveBeenCalledWith('high');
    console.log(`  RecipeRateCards : clicking "High Rate" calls onFilterChange("high")`);
  });

  it('toggles filter off when active card is clicked again', () => {
    const onChange = vi.fn();
    render(<RecipeRateCards tierCounts={tierCounts} activeFilter="high" onFilterChange={onChange} />);
    fireEvent.click(screen.getByText('High Rate'));
    expect(onChange).toHaveBeenCalledWith('all');
    console.log(`  RecipeRateCards : clicking active "High Rate" resets to "all"`);
  });
});
