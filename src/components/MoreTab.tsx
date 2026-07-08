import { useRef, useState } from 'react';
import type { TripData } from '../types';

type Props = {
  data: TripData;
  onImport: (data: TripData) => void;
};

const TRAVEL_TIPS: { icon: string; title: string; body: string }[] = [
  { icon: '💴', title: '팁 문화 없음', body: '팁을 주면 오히려 당황해요. 계산은 표시된 금액 그대로.' },
  { icon: '🔌', title: '콘센트는 11자(A타입)', body: '한국 둥근 플러그는 안 들어가요. 돼지코 어댑터 필수! 전압은 100V라 프리볼트(100-240V) 기기만 그대로 사용.' },
  { icon: '🛗', title: '에스컬레이터 서는 방향', body: '도쿄는 왼쪽에 서고 오른쪽을 비워요. 오사카는 반대(오른쪽 서기).' },
  { icon: '🗑️', title: '길에 쓰레기통이 거의 없음', body: '작은 봉투를 들고 다니다가 편의점·역·자판기 옆 수거함을 이용하세요.' },
  { icon: '💵', title: '현금 아직 중요', body: '작은 식당·신사·시장은 현금만 받는 곳이 많아요. 1만엔권은 편의점에서 미리 잔돈으로.' },
  { icon: '🤫', title: '전철에서는 조용히', body: '전화 통화는 금물, 휴대폰은 매너모드. 우선석 근처에선 특히 조심.' },
  { icon: '🍜', title: '오토시(자릿세)', body: '이자카야에서 시키지 않은 안주가 나오면 1인당 300~500엔쯤의 자릿세예요. 상술이 아니니 당황하지 마세요.' },
  { icon: '♨️', title: '온천·센토 문신 규정', body: '문신이 있으면 입장 제한하는 곳이 있어요. 커버 스티커를 준비하거나 문신 OK 온천을 미리 검색.' },
  { icon: '🚶', title: '보행·차량 좌측통행', body: '차가 오른쪽에서 와요. 길 건널 때 습관적으로 왼쪽만 보지 말 것!' },
  { icon: '🚬', title: '길거리 흡연 금지', body: '지정 흡연소에서만. 걷면서 피우면 과태료 지역이 많아요.' },
  { icon: '🧾', title: '편의점 결제 매너', body: '돈은 점원 손이 아니라 계산대 트레이에 올려놓는 게 기본이에요.' },
];

const EMERGENCY_CONTACTS = [
  { category: '일본 긴급전화', items: [
    { name: '경찰', value: '110', tel: '110' },
    { name: '구급차·화재', value: '119', tel: '119' },
    { name: '해상 사고', value: '118', tel: '118' },
    { name: 'Japan Visitor Hotline (JNTO, 24시간·다국어)', value: '050-3816-2787', tel: '05038162787' },
  ]},
  { category: '대한민국 영사 지원', items: [
    { name: '외교부 영사콜센터 (24시간)', value: '+82-2-3210-0404', tel: '+8223210 0404' },
    { name: '주일본 대한민국 대사관 (도쿄)', value: '+81-3-3452-7611', tel: '+81334527611' },
    { name: '해외안전여행 사이트', value: '0404.go.kr', href: 'https://www.0404.go.kr' },
  ]},
];

function todayStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export default function MoreTab({ data, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-trip-backup-${todayStamp()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'ok', text: '백업 파일을 다운로드했어요. 안전한 곳에 보관하세요.' });
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<TripData>;
      if (!parsed || typeof parsed !== 'object' || !('trip' in parsed) || !('itinerary' in parsed)) {
        setMessage({ kind: 'error', text: '이 앱의 백업 파일이 아닌 것 같아요.' });
        return;
      }
      if (!window.confirm('현재 데이터를 백업 파일 내용으로 덮어쓸까요? 이 작업은 되돌릴 수 없어요.')) {
        return;
      }
      onImport(parsed as TripData);
      setMessage({ kind: 'ok', text: '백업을 불러왔어요!' });
    } catch {
      setMessage({ kind: 'error', text: '파일을 읽지 못했어요. 올바른 백업 파일인지 확인해주세요.' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
          🆘 긴급 정보
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {EMERGENCY_CONTACTS.map((group) => (
            <div key={group.category} className="px-3 py-2 space-y-1.5">
              <p className="text-xs font-semibold text-gray-400">{group.category}</p>
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 min-w-0 text-left text-gray-700 dark:text-gray-300">{item.name}</span>
                  {'tel' in item && item.tel ? (
                    <a
                      href={`tel:${item.tel.replace(/[^+\d]/g, '')}`}
                      className="shrink-0 font-semibold text-accent-600 dark:text-accent-400"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <a
                      href={'href' in item ? item.href : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 font-semibold text-accent-600 dark:text-accent-400"
                    >
                      {item.value}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
          이 카드는 오프라인에서도 열려요. 전화번호는 출국 전 한 번 확인해두는 걸 권장해요.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
          🍶 일본 여행 팁
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {TRAVEL_TIPS.map((tip) => (
            <div key={tip.title} className="px-3 py-2 text-left">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {tip.icon} {tip.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tip.body}</p>
            </div>
          ))}
        </div>
        <p className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
          오프라인에서도 열려요.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
          💾 데이터 백업/복원
        </div>
        <div className="p-3 space-y-2">
          <p className="text-xs text-gray-400 text-left">
            여행 데이터는 이 브라우저에만 저장돼요. 폰을 바꾸거나 브라우저 데이터를 지우면 사라지니,
            백업 파일을 만들어두세요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex-1 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] py-2 text-sm font-medium hover:bg-accent-700"
            >
              ⬇️ 백업 파일 내려받기
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl bg-accent-50 dark:bg-accent-500/15 border-0 text-accent-600 dark:text-accent-400 py-2 text-sm font-medium"
            >
              ⬆️ 백업 불러오기
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = '';
            }}
          />
          {message && (
            <p className={`text-xs ${message.kind === 'ok' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        일본 여행일지 · 오프라인 지원 · 데이터는 내 기기에만 저장
      </p>
    </div>
  );
}
