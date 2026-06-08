/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useContext, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { DeepPartial } from 'tsdef';

// ──────────────────────────────────────────────
// Theme definitions
// ──────────────────────────────────────────────

export const lightTheme = {
    palette: {
        background: {
            paper: '#ffffff',
            default: '#fafafa',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
    },
    colors: {
        debugRed: '#fabdbd',
        debugBlue: '#bdd8fa',
        debugGreen: '#d2fabd',
        debugPurple: '#d2bdfa',
        debugYellow: '#fae9bd',

        textActive: '#09f',
    },

    fontSizes: {
        rootPrimary: 15,
    },

    margins: {
        rootLayoutMargin: 8,
    },

    toolbar: {
        size: 30,
        lineHeight: '30px',
        fontSize: 15,
        buttonRadius: 4,
    },

    dnd: {
        canDropColor: 'green',
        cannotDropColor: 'red',
        canDropMask: 'rgba(180, 235, 180, 0.75)',
        cannotDropMask: 'rgba(235, 180, 180, 0.75)',
        fileListCanDropMaskOne: 'rgba(180, 235, 180, 0.1)',
        fileListCanDropMaskTwo: 'rgba(180, 235, 180, 0.2)',
        fileListCannotDropMaskOne: 'rgba(235, 180, 180, 0.1)',
        fileListCannotDropMaskTwo: 'rgba(235, 180, 180, 0.2)',
    },

    dragLayer: {
        border: 'solid 2px #09f',
        padding: '7px 10px',
        borderRadius: 2,
    },

    fileList: {
        desktopGridGutter: 8,
        mobileGridGutter: 5,
    },

    gridFileEntry: {
        childrenCountSize: '1.6em',
        iconColorFocused: '#000',
        iconSize: '2.4em',
        iconColor: '#fff',
        borderRadius: 5,
        fontSize: 14,

        fileColorTint: 'rgba(255, 255, 255, 0.4)',
        folderBackColorTint: 'rgba(255, 255, 255, 0.1)',
        folderFrontColorTint: 'rgba(255, 255, 255, 0.4)',
    },

    listFileEntry: {
        propertyFontSize: 14,
        iconFontSize: '1.1em',
        iconBorderRadius: 5,
        fontSize: 14,
    },
};

export type ChonkyTheme = typeof lightTheme;

export const darkThemeOverride: DeepPartial<ChonkyTheme> = {
    palette: {
        background: {
            paper: '#424242',
            default: '#303030',
        },
        text: {
            primary: '#ffffff',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
    },
    gridFileEntry: {
        fileColorTint: 'rgba(50, 50, 50, 0.4)',
        folderBackColorTint: 'rgba(50, 50, 50, 0.4)',
        folderFrontColorTint: 'rgba(50, 50, 50, 0.15)',
    },
};

export const mobileThemeOverride: DeepPartial<ChonkyTheme> = {
    fontSizes: {
        rootPrimary: 13,
    },
    margins: {
        rootLayoutMargin: 4,
    },
    toolbar: {
        size: 28,
        lineHeight: '28px',
        fontSize: 13,
    },
    gridFileEntry: {
        fontSize: 13,
    },
    listFileEntry: {
        propertyFontSize: 12,
        iconFontSize: '1em',
        fontSize: 13,
    },
};

// ──────────────────────────────────────────────
// Theme context
// ──────────────────────────────────────────────

export const ChonkyThemeContext = React.createContext<ChonkyTheme>(lightTheme);

export const useChonkyTheme = () => useContext(ChonkyThemeContext);

// ──────────────────────────────────────────────
// useMediaQuery replacement (no MUI dependency)
// ──────────────────────────────────────────────

export const useIsMobileBreakpoint = () => {
    const [isMobile, setIsMobile] = React.useState(() => {
        if (typeof globalThis.matchMedia !== 'function') return false;
        return globalThis.matchMedia('(max-width:480px)').matches;
    });
    useEffect(() => {
        if (typeof globalThis.matchMedia !== 'function') return;
        const mql = globalThis.matchMedia('(max-width:480px)');
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);
    return isMobile;
};

// ──────────────────────────────────────────────
// Utility functions
// ──────────────────────────────────────────────

export const getStripeGradient = (colorOne: string, colorTwo: string) =>
    'repeating-linear-gradient(' +
    '45deg,' +
    `${colorOne},` +
    `${colorOne} 10px,` +
    `${colorTwo} 0,` +
    `${colorTwo} 20px` +
    ')';

export const important = <T>(value: T) => [value, '!important'] as any;

export const c: (...args: any[]) => string = classnames;

// ──────────────────────────────────────────────
// CSS-in-JS engine (replaces react-jss)
// ──────────────────────────────────────────────

let localStyleCounter = 0;
let globalStyleCounter = 0;
const stylesheetRefs = new Map<string, number>();

/** Convert camelCase CSS property to kebab-case, handling vendor prefixes. */
function camelToKebab(key: string): string {
    const result = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    // Fix vendor prefixes: `webkit` → `-webkit`, `ms` → `-ms`, etc.
    if (result.startsWith('-webkit')) return `-${result}`;
    if (result.startsWith('-ms')) return `-${result}`;
    if (result.startsWith('-moz')) return `-${result}`;
    return result;
}

function resolveCSSValue(value: any): string {
    if (typeof value === 'number') return `${value}px`;
    if (Array.isArray(value)) {
        // The `important()` helper wraps in an array with '!important' marker
        if (value.length === 2 && value[1] === '!important') {
            return `${resolveCSSValue(value[0])} !important`;
        }
        return value.map((v) => resolveCSSValue(v)).join(' ');
    }
    return String(value);
}

/**
 * Generate a CSS string from a single style property entry.
 */
function propToCSS(key: string, value: any, dynamic?: any): string {
    const cssKey = camelToKebab(key);
    if (typeof value === 'function') {
        return `${cssKey}: ${resolveCSSValue(value(dynamic))};`;
    }
    return `${cssKey}: ${resolveCSSValue(value)};`;
}

function isNestedStyle(value: any): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveNestedSelector(selector: string, key: string): string {
    if (key.startsWith('&')) return key.replace(/&/g, selector);
    return `${selector} ${key}`;
}

function safeStringify(value: any): string {
    try {
        return JSON.stringify(value) ?? '';
    } catch {
        return String(value);
    }
}

function hashString(value: string): string {
    let hash = 5381;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
}

function styleAtRuleToCSS(
    atRule: string,
    selector: string,
    value: any,
    dynamic?: any,
    resolveLocalRef?: (name: string) => string
): string {
    if (atRule.startsWith('@global ')) {
        const globalSelector = atRule.replace('@global ', '').trim();
        return styleObjToCSS(globalSelector, value, dynamic, resolveLocalRef);
    }
    if (!isNestedStyle(value)) return '';

    let inner = '';
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (isNestedStyle(nestedValue)) {
            inner += styleObjToCSS(
                resolveNestedSelector(selector, nestedKey),
                nestedValue,
                dynamic,
                resolveLocalRef
            );
        } else {
            inner += styleObjToCSS(
                selector,
                { [nestedKey]: nestedValue },
                dynamic,
                resolveLocalRef
            );
        }
    }
    return `${atRule} {\n${inner}}\n`;
}

/**
 * Walk a nested style object (which may include `&` pseudo-selectors,
 * nested selectors, `@keyframes`, `@media`, etc.) and produce a CSS string.
 * `resolveLocalRef` lets the caller replace `$name` references with the
 * actual generated name (used for animation names).
 */
function styleObjToCSS(
    selector: string,
    obj: any,
    dynamic?: any,
    resolveLocalRef?: (name: string) => string
): string {
    const declarations: string[] = [];
    const nestedRules: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('@keyframes')) {
            // `@keyframes` is handled at the top level – skip here.
            continue;
        }
        if (key.startsWith('@')) {
            nestedRules.push(styleAtRuleToCSS(key, selector, value, dynamic, resolveLocalRef));
            continue;
        }
        if (key.startsWith('&')) {
            // Pseudo-class / pseudo-element
            nestedRules.push(styleObjToCSS(
                resolveNestedSelector(selector, key),
                value,
                dynamic,
                resolveLocalRef
            ));
            continue;
        }
        if (isNestedStyle(value)) {
            // Descendant or child selector
            nestedRules.push(styleObjToCSS(
                resolveNestedSelector(selector, key),
                value,
                dynamic,
                resolveLocalRef
            ));
            continue;
        }

        // Handle `$name` references in values (e.g. animationName: '$loading-placeholder')
        let resolvedValue = value;
        if (resolveLocalRef && typeof value === 'string' && value.startsWith('$')) {
            resolvedValue = resolveLocalRef(value.slice(1));
        }
        declarations.push(`  ${propToCSS(key, resolvedValue, dynamic)}`);
    }
    const block = declarations.length
        ? `${selector} {\n${declarations.join('\n')}\n}\n`
        : '';
    return block + nestedRules.join('');
}

function injectStylesheet(id: string, css: string) {
    if (typeof document === 'undefined') return;
    stylesheetRefs.set(id, (stylesheetRefs.get(id) ?? 0) + 1);

    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
        el = document.createElement('style');
        el.id = id;
        el.dataset.chonky = '';
        document.head.appendChild(el);
    }
    if (el.textContent !== css) {
        el.textContent = css;
    }
}

function removeStylesheet(id: string) {
    if (typeof document === 'undefined') return;
    const nextRefCount = (stylesheetRefs.get(id) ?? 0) - 1;
    if (nextRefCount > 0) {
        stylesheetRefs.set(id, nextRefCount);
        return;
    }
    stylesheetRefs.delete(id);
    const el = document.getElementById(id);
    if (el) el.remove();
}

/**
 * `makeLocalChonkyStyles` – replaces react-jss `createUseStyles` for local
 * (component-scoped) styles. Returns a hook that accepts an optional dynamic
 * argument and returns a className map.
 */
export const makeLocalChonkyStyles = (
    styles: (theme: ChonkyTheme) => any
): ((dynamic?: any) => Record<string, string>) => {
    const componentId = localStyleCounter++;

    return (dynamic?: any): Record<string, string> => {
        const theme = useChonkyTheme();
        const styleObj = styles(theme);
        const styleSignature = hashString(safeStringify({ styleObj, dynamic, theme }));
        const prefix = `cls-${componentId}-${styleSignature}`;

        // Collect `@keyframes` first and generate unique names
        const keyframeMapping: Record<string, string> = {};
        const cssParts: string[] = [];
        const classes: Record<string, string> = {};

        for (const [key, value] of Object.entries(styleObj)) {
            if (key.startsWith('@keyframes')) {
                const kfName = key.replace('@keyframes ', '').trim();
                const generatedName = `${prefix}-kf-${kfName}`;
                keyframeMapping[kfName] = generatedName;
                let kfCSS = `@keyframes ${generatedName} {\n`;
                for (const [pct, props] of Object.entries(value as any)) {
                    kfCSS += `  ${pct} {\n`;
                    for (const [pk, pv] of Object.entries(props as any)) {
                        kfCSS += `    ${propToCSS(pk, pv)}\n`;
                    }
                    kfCSS += `  }\n`;
                }
                kfCSS += `}\n`;
                cssParts.push(kfCSS);
                continue;
            }
        }

        // Generate class-based CSS
        for (const [key, value] of Object.entries(styleObj)) {
            if (key.startsWith('@keyframes')) continue;
            const className = `${prefix}-${key}`;
            classes[key] = className;
            const selector = `.${className}`;
            const resolveLocalRef = (name: string) => keyframeMapping[name] || name;
            cssParts.push(styleObjToCSS(selector, value, dynamic, resolveLocalRef));
        }

        const css = cssParts.join('\n');
        const styleId = `ch-styles-${componentId}-${styleSignature}`;

        // Track previous dynamic state to decide if we need to re-inject
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (css.trim()) {
                injectStylesheet(styleId, css);
            }
            return () => removeStylesheet(styleId);
            // Re-inject when CSS changes (dynamic state or theme)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [css, styleId]);

        return classes;
    };
};

/**
 * `makeGlobalChonkyStyles` – replaces the global-styles variant.
 * Generates CSS class names with a deterministic `chonky-` prefix.
 */
export const makeGlobalChonkyStyles = (
    makeStyles: (theme: ChonkyTheme) => any
): ((...args: any[]) => Record<string, string>) => {
    const componentId = globalStyleCounter++;

    // Build selector mapping once (static)
    // We need a closure around the factory to inspect keys
    const styleFactory = makeStyles;

    return (...args: any[]): Record<string, string> => {
        const theme = useChonkyTheme();
        const dynamic = args[0];

        const localStyles = styleFactory(theme);
        const cssParts: string[] = [];
        const classes: Record<string, string> = {};

        for (const localSelector of Object.keys(localStyles)) {
            const globalSelector = `chonky-${localSelector}`;
            classes[localSelector] = globalSelector;
            const selDef = localStyles[localSelector];
            // Generate: `.chonky-XXX { ... }` directly
            cssParts.push(styleObjToCSS(`.${globalSelector}`, selDef, dynamic));
        }

        const css = cssParts.join('\n');
        const styleSignature = hashString(safeStringify({ localStyles, dynamic, theme }));
        const styleId = `ch-global-styles-${componentId}-${styleSignature}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (css.trim()) {
                injectStylesheet(styleId, css);
            }
            return () => removeStylesheet(styleId);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [css, styleId]);

        return classes;
    };
};
