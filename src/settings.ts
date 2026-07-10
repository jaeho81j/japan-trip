import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type AccentKey = 'blue' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'violet' | 'stone';
export type DarkMode = 'system' | 'light' | 'dark';
export type FontSize = 'sm' | 'md' | 'lg';
export type FontKey = 'pretendard' | 'system' | 'serif';
export type RadiusKey = 'sharp' | 'normal' | 'round';

export type AppSettings = {
  accent: AccentKey;
  darkMode: DarkMode;
  fontSize: FontSize;
  font: FontKey;
  radius: RadiusKey;
  // 포인트 컬러 채도(40–140) · 명도(60–130) 조정 (%)
  satPct: number;
  lightPct: number;
  // 서브탭 바 투명도 (0=불투명 … 60=많이 비침) %
  subtabTransparency: number;
};

export const defaultSettings: AppSettings = {
  accent: 'blue',
  darkMode: 'system',
  fontSize: 'md',
  font: 'pretendard',
  radius: 'normal',
  satPct: 100,
  lightPct: 100,
  subtabTransparency: 0,
};

type Palette = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;

export const ACCENTS: { key: AccentKey; label: string; palette: Palette }[] = [
  {
    key: 'blue',
    label: '블루',
    palette: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#8fc2ff', 400: '#4d9dff', 500: '#0a84ff', 600: '#0071e3', 700: '#0059b8', 800: '#004a96', 900: '#003c78', 950: '#00274d' },
  },
  {
    key: 'indigo',
    label: '인디고',
    palette: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  },
  {
    key: 'rose',
    label: '로즈',
    palette: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  },
  {
    key: 'emerald',
    label: '그린',
    palette: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  },
  {
    key: 'amber',
    label: '앰버',
    palette: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  },
  {
    key: 'sky',
    label: '스카이',
    palette: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
  },
  {
    key: 'violet',
    label: '바이올렛',
    palette: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  },
  {
    key: 'stone',
    label: '스톤',
    palette: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' },
  },
];

const FONT_STACKS: Record<FontKey, string> = {
  pretendard:
    "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  system:
    "-apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  serif: "'Noto Serif KR', 'Apple SD Gothic Neo', serif",
};

export const FONT_OPTIONS: { key: FontKey; label: string }[] = [
  { key: 'pretendard', label: '프리텐다드' },
  { key: 'system', label: '시스템 기본' },
  { key: 'serif', label: '명조' },
];

const FONT_SIZES: Record<FontSize, string> = { sm: '15px', md: '16px', lg: '17.5px' };

export const FONT_SIZE_OPTIONS: { key: FontSize; label: string }[] = [
  { key: 'sm', label: '작게' },
  { key: 'md', label: '보통' },
  { key: 'lg', label: '크게' },
];

export const DARK_MODE_OPTIONS: { key: DarkMode; label: string }[] = [
  { key: 'system', label: '시스템' },
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
];

const RADII: Record<RadiusKey, Record<string, string>> = {
  sharp: { '--radius-md': '0.25rem', '--radius-lg': '0.375rem', '--radius-xl': '0.5rem', '--radius-2xl': '0.625rem' },
  normal: { '--radius-md': '0.375rem', '--radius-lg': '0.5rem', '--radius-xl': '0.75rem', '--radius-2xl': '1rem' },
  round: { '--radius-md': '0.625rem', '--radius-lg': '0.875rem', '--radius-xl': '1.125rem', '--radius-2xl': '1.5rem' },
};

export const RADIUS_OPTIONS: { key: RadiusKey; label: string }[] = [
  { key: 'sharp', label: '각지게' },
  { key: 'normal', label: '보통' },
  { key: 'round', label: '둥글게' },
];

// #rrggbb → [h(0-360), s(0-100), l(0-100)]
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let sat = 0;
  const d = max - min;
  if (d !== 0) {
    sat = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, sat * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function applySettings(s: AppSettings, systemDark: boolean) {
  const root = document.documentElement;

  // 포인트 컬러 (+ 채도·명도 조정)
  const accent = ACCENTS.find((a) => a.key === s.accent) ?? ACCENTS[0];
  const satF = (s.satPct ?? 100) / 100;
  const lightF = (s.lightPct ?? 100) / 100;
  const adjust = (hex: string) => {
    if (satF === 1 && lightF === 1) return hex;
    const [h, sv, lv] = hexToHsl(hex);
    return hslToHex(h, clamp(sv * satF, 0, 100), clamp(lv * lightF, 0, 100));
  };
  for (const [shade, hex] of Object.entries(accent.palette)) {
    root.style.setProperty(`--accent-${shade}`, adjust(hex));
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', adjust(accent.palette[600]));

  // 다크모드
  const dark = s.darkMode === 'dark' || (s.darkMode === 'system' && systemDark);
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);

  // 서브탭 바 투명도 (0=불투명 → 알파 1)
  root.style.setProperty('--subtab-alpha', String(1 - (s.subtabTransparency ?? 0) / 100));

  // 글꼴 · 크기 · 모서리
  root.style.setProperty('--app-font', FONT_STACKS[s.font]);
  root.style.setProperty('--app-font-size', FONT_SIZES[s.fontSize]);
  for (const [k, v] of Object.entries(RADII[s.radius])) {
    root.style.setProperty(k, v);
  }
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('japan-travel-settings', defaultSettings);
  const merged: AppSettings = { ...defaultSettings, ...settings };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applySettings(merged, mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged.accent, merged.darkMode, merged.fontSize, merged.font, merged.radius, merged.satPct, merged.lightPct, merged.subtabTransparency]);

  return [merged, setSettings] as const;
}
