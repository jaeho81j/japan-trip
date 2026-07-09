import { useEffect, useState } from 'react';

function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <path d="M8 26h84v8H8z" />
      <path d="M14 34h72l-5 7H19z" />
      <path d="M24 41h9v52h-9zM67 41h9v52h-9z" />
      <path d="M20 50h60v6H20z" />
    </svg>
  );
}

// 앱 시작 시 잠깐 보이는 스플래시 (온보딩 첫 화면과 동일한 룩). 약 1.1초 후 페이드아웃.
export default function Splash() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFading(true), 900);
    const t2 = window.setTimeout(() => setGone(true), 1250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] max-w-md mx-auto bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center transition-opacity duration-300 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="h-24 w-24 rounded-[24px] bg-gradient-to-br from-[#3B82F6] to-[#2152D8] text-white flex items-center justify-center shadow-[0_16px_36px_-12px_rgba(37,99,235,0.6)]">
        <Torii className="h-12 w-12" />
      </div>
      <p className="mt-5 text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">일본 여행</p>
      <p className="mt-1 text-[13px] text-gray-400">여행 준비의 모든 것</p>
    </div>
  );
}
