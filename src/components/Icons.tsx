// 라인 스타일 SVG 아이콘 모음 (하단 네비게이션 · 헤더 등). 이모지 대신 사용.
type IconProps = { className?: string; filled?: boolean };

const base = (className = '') => ({
  className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)} fill={filled ? 'currentColor' : 'none'} strokeWidth={filled ? 0 : 1.8}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function CalendarIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" fill={filled ? 'currentColor' : 'none'} />
      <path d="M3 9h18M8 3v3M16 3v3" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function TicketIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2a2 2 0 0 0 0 4v2A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-2a2 2 0 0 0 0-4z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M13 6v11" stroke={filled ? '#fff' : 'currentColor'} strokeDasharray="1.5 2" />
    </svg>
  );
}

export function YenIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} />
      <path d="M9 8l3 4 3-4M12 12v5M9.5 13h5M9.5 15.3h5" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function CheckIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill={filled ? 'currentColor' : 'none'} />
      <path d="M8 12.2l2.8 2.8L16.5 9" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function CompassIcon({ className, filled }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} />
      <path d="M15.5 8.5l-1.6 4.4-4.4 1.6 1.6-4.4z" stroke={filled ? '#fff' : 'currentColor'} fill={filled ? '#fff' : 'none'} />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 8h9M18 8h1M5 16h1M10 16h9" />
      <circle cx="16" cy="8" r="2.2" />
      <circle cx="8" cy="16" r="2.2" />
    </svg>
  );
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// 대각선 화살표 (항공편 카드: 출발 ↗ / 도착 ↙)
export function FlightArrow({ className, dir }: IconProps & { dir: 'out' | 'in' }) {
  return (
    <svg {...base(className)}>
      {dir === 'out' ? (
        <path d="M7 17L17 7M9 7h8v8" />
      ) : (
        <path d="M17 7L7 17M15 17H7V9" />
      )}
    </svg>
  );
}

export type NavIconName = 'home' | 'plan' | 'wallet' | 'money' | 'lists' | 'guide';

export function NavIcon({ name, active, className }: { name: NavIconName; active: boolean; className?: string }) {
  const props = { className, filled: active };
  switch (name) {
    case 'home':
      return <HomeIcon {...props} />;
    case 'plan':
      return <CalendarIcon {...props} />;
    case 'wallet':
      return <TicketIcon {...props} />;
    case 'money':
      return <YenIcon {...props} />;
    case 'lists':
      return <CheckIcon {...props} />;
    case 'guide':
      return <CompassIcon {...props} />;
  }
}
