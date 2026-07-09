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

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}
export function RefreshIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 11a8 8 0 1 0-.9 4.5" />
      <path d="M20 5v6h-6" />
    </svg>
  );
}
export function PinIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  );
}
export function BedIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 8v11M3 12h18a2 2 0 0 1 2 2v5M21 19v-5" />
      <path d="M7 12v-2.5A1.5 1.5 0 0 1 8.5 8h8A1.5 1.5 0 0 1 18 9.5V12" />
    </svg>
  );
}
export function IdIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.6-1.6 4.4-1.6 5 0M14 9.5h4M14 12.5h4M14 15.5h2.5" />
    </svg>
  );
}
export function BagIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}
export function DocIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  );
}
export function FolderIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}
export function PaletteIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z" />
      <circle cx="7.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.2" />
    </svg>
  );
}
export function BarChartIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  );
}
export function CalcIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h0M12 11h0M16 11h0M8 14h0M12 14h0M16 14v4M8 17h4" />
    </svg>
  );
}
export function DivideIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12h14" />
      <circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function TrainIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="6" y="3" width="12" height="14" rx="3" />
      <path d="M6 10h12M9 20l-2 2M15 20l2 2" />
      <circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function SwapIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}
export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
    </svg>
  );
}
export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3v12M7 11l5 4 5-4M4 20h16" />
    </svg>
  );
}
export function UploadIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 15V3M7 7l5-4 5 4M4 20h16" />
    </svg>
  );
}
export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 16.5v.2" />
    </svg>
  );
}
export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H6a2 2 0 0 1-2-2z" />
      <path d="M8.5 9.5h7M8.5 12.5h4" />
    </svg>
  );
}
export function MapIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 5v14M5 12h14" />
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
