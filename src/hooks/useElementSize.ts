import { useCallback, useRef, useState } from 'react';

/** Observes `clientWidth` / `clientHeight` of a box (e.g. react-window viewport). Uses a callback ref so late-mounted nodes (after async loading) are observed. */
export function useElementSize<T extends HTMLElement>() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const roRef = useRef<ResizeObserver | null>(null);

    const ref = useCallback((el: T | null) => {
        roRef.current?.disconnect();
        roRef.current = null;
        if (!el) {
            setSize({ width: 0, height: 0 });
            return;
        }
        const measure = () => {
            setSize({ width: el.clientWidth, height: el.clientHeight });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        roRef.current = ro;
    }, []);

    return { ref, width: size.width, height: size.height };
}
