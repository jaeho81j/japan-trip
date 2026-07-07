import { useRef, useState } from 'react';
import type { QrState } from '../types';

type Props = {
  qr: QrState;
  onChange: (qr: QrState) => void;
};

type SlotKey = keyof QrState;

const SLOTS: { key: SlotKey; title: string; hint: string; link?: { label: string; href: string } }[] = [
  {
    key: 'visitJapan',
    title: '🛂 Visit Japan Web QR',
    hint: '입국심사·세관 신고 QR 스크린샷을 등록해두세요.',
    link: { label: 'Visit Japan Web 열기', href: 'https://www.vjw.digital.go.jp/' },
  },
  {
    key: 'taxFree',
    title: '🛍️ 면세 QR (여권 정보)',
    hint: '면세 수속용 QR(Visit Japan Web 면세 QR 등)을 등록해두세요.',
  },
];

// Downscale + recompress so two screenshots comfortably fit in localStorage.
async function compressImage(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('image load failed'));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

export default function QrTab({ qr, onChange }: Props) {
  const fileRefs = {
    visitJapan: useRef<HTMLInputElement>(null),
    taxFree: useRef<HTMLInputElement>(null),
  };
  const [error, setError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<SlotKey | null>(null);

  const upload = async (slot: SlotKey, file: File) => {
    setError(null);
    try {
      const compressed = await compressImage(file);
      onChange({ ...qr, [slot]: compressed });
    } catch {
      setError('이미지를 불러오지 못했어요. 다른 파일로 시도해주세요.');
    }
  };

  const remove = (slot: SlotKey) => {
    if (window.confirm('등록된 QR 이미지를 삭제할까요?')) {
      onChange({ ...qr, [slot]: null });
    }
  };

  if (zoomed && qr[zoomed]) {
    return (
      <button
        className="fixed inset-0 z-[2000] bg-white flex items-center justify-center p-2"
        onClick={() => setZoomed(null)}
      >
        <img src={qr[zoomed]!} alt="QR 확대" className="max-w-full max-h-full object-contain" />
        <span className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
          화면을 탭하면 돌아가요 · 밝기를 최대로 올리면 스캔이 잘 돼요
        </span>
      </button>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      {SLOTS.map((slot) => (
        <div key={slot.key} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{slot.title}</span>
            {slot.link && (
              <a
                href={slot.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:text-indigo-600"
              >
                {slot.link.label} ↗
              </a>
            )}
          </div>

          {qr[slot.key] ? (
            <div className="bg-white">
              <button className="w-full" onClick={() => setZoomed(slot.key)}>
                <img
                  src={qr[slot.key]!}
                  alt={`${slot.title} 이미지`}
                  className="w-full max-h-[34vh] object-contain"
                />
              </button>
              <div className="flex divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setZoomed(slot.key)}
                  className="flex-1 py-2 text-sm text-indigo-600 dark:text-indigo-500 font-medium"
                >
                  🔍 크게 보기
                </button>
                <button
                  onClick={() => fileRefs[slot.key].current?.click()}
                  className="flex-1 py-2 text-sm text-gray-500"
                >
                  교체
                </button>
                <button onClick={() => remove(slot.key)} className="flex-1 py-2 text-sm text-rose-500">
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRefs[slot.key].current?.click()}
              className="w-full h-[26vh] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-500"
            >
              <span className="text-3xl">➕</span>
              <span className="text-sm">QR 스크린샷 등록</span>
              <span className="text-xs px-6">{slot.hint}</span>
            </button>
          )}

          <input
            ref={fileRefs[slot.key]}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(slot.key, file);
              e.target.value = '';
            }}
          />
        </div>
      ))}

      {error && <p className="text-xs text-rose-500">{error}</p>}
      <p className="text-center text-xs text-gray-400">
        등록한 QR은 이 기기에만 저장되고 오프라인에서도 열려요. 공항에서는 🔍 크게 보기로 띄워서 스캔받으세요.
      </p>
    </div>
  );
}
