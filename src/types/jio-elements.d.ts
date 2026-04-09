import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type JioNavbarProps = DetailedHTMLProps<
    HTMLAttributes<HTMLElement> & {
        property?: string;
        theme?: string;
        locationPathname?: string;
        showSearchBox?: boolean;
    },
    HTMLElement
>;

type JioFooterProps = DetailedHTMLProps<
    HTMLAttributes<HTMLElement> & {
        property?: string;
        license?: string;
        githubRepo?: string;
        githubBranch?: string;
        sourcePath?: string;
        reportAProblemTemplate?: string;
        reportAProblemTemplateField?: string;
        reportAProblemLabels?: string;
        skipReportIssue?: boolean;
    },
    HTMLElement
>;

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'jio-navbar': JioNavbarProps;
            'jio-footer': JioFooterProps;
        }
    }
}

export {};
