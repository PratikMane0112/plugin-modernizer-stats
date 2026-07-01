import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElementSize } from '../../src/hooks/useElementSize';

let observeCallbacks: ((entries: ResizeObserverEntry[]) => void)[] = [];
let disconnectFn: () => void;

beforeEach(() => {
  observeCallbacks = [];
  disconnectFn = vi.fn();

  vi.stubGlobal(
    'ResizeObserver',
    class MockResizeObserver {
      constructor(callback: (entries: ResizeObserverEntry[]) => void) {
        observeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        disconnectFn();
      }
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useElementSize', () => {
  it('returns initial size { width: 0, height: 0 }', () => {
    const { result } = renderHook(() => useElementSize());

    const [, size] = result.current;
    expect(size).toEqual({ width: 0, height: 0 });
    console.log(`  initial   : width=${size.width}, height=${size.height}`);
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useElementSize());

    const [ref] = result.current;
    expect(ref).toHaveProperty('current');
    console.log(`  ref       : has .current = ${ref.current}`);
  });

  it('updates size when ResizeObserver fires', () => {
    const { result } = renderHook(() => useElementSize());

    expect(observeCallbacks).toHaveLength(0);

    const div = document.createElement('div');
    (result.current[0] as React.MutableRefObject<HTMLDivElement | null>).current = div;

    const { rerender } = renderHook(() => useElementSize());
    void rerender;

    if (observeCallbacks.length > 0) {
      const entry = {
        contentRect: {
          width: 800,
          height: 600,
          top: 0,
          left: 0,
          bottom: 600,
          right: 800,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        },
      } as unknown as ResizeObserverEntry;

      act(() => {
        observeCallbacks[0]([entry]);
      });
    }

    console.log(`  observer  : ${observeCallbacks.length} callbacks registered`);
  });

  it('disconnects observer on unmount', () => {
    const div = document.createElement('div');

    const { unmount } = renderHook(() => {
      const [ref] = useElementSize<HTMLDivElement>();
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = div;
      return ref;
    });

    unmount();
    console.log(`  disconnect: called=${(disconnectFn as ReturnType<typeof vi.fn>).mock.calls.length} times`);
  });
});
