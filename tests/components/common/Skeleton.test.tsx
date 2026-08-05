import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  SkeletonStatCards,
  SkeletonChart,
  SkeletonTable,
  SkeletonDetail,
  SkeletonTimeline,
  SkeletonList,
} from '../../../src/components/common/Skeleton';

describe('Skeleton components', () => {
  it('SkeletonStatCards renders skeleton placeholders', () => {
    const { container } = render(<SkeletonStatCards />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonStatCards : ${skeletons.length} skeleton elements`);
  });

  it('SkeletonChart renders skeleton placeholders', () => {
    const { container } = render(<SkeletonChart />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonChart : ${skeletons.length} skeleton elements`);
  });

  it('SkeletonTable renders skeleton rows', () => {
    const { container } = render(<SkeletonTable />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonTable : ${skeletons.length} skeleton elements`);
  });

  it('SkeletonDetail renders skeleton layout', () => {
    const { container } = render(<SkeletonDetail />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonDetail : ${skeletons.length} skeleton elements`);
  });

  it('SkeletonTimeline renders skeleton placeholders', () => {
    const { container } = render(<SkeletonTimeline />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonTimeline : ${skeletons.length} skeleton elements`);
  });

  it('SkeletonList renders skeleton rows', () => {
    const { container } = render(<SkeletonList />);
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    console.log(`  SkeletonList : ${skeletons.length} skeleton elements`);
  });
});
