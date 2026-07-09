import { useRef, useState, type ComponentType } from 'react';
import type { FlightsState, QrState, TravelDocument } from '../types';
import { compressImage } from '../imageUtils';
import BoardingPass from './BoardingPass';
import { IdIcon, BagIcon, FolderIcon, SearchIcon, PlusIcon } from './Icons';

type Props = {
  qr: QrState;
  onChange: (qr: QrState) => void;
  documents: TravelDocument[];
  onDocumentsChange: (documents: TravelDocument[]) => void;
  flights: FlightsState;
};

type SlotKey = keyof QrState;

const SLOTS: { key: SlotKey; title: string; hint: string; Icon: ComponentType<{ className?: string }>; link?: { label: string; href: string } }[] = [
  {
    key: 'visitJapan',
    title: 'Visit Japan Web QR',
    Icon: IdIcon,
    hint: '입국심사·세관 신고 QR 스크린샷을 등록해두세요.',
    link: { label: 'Visit Japan Web 열기', href: 'https://www.vjw.digital.go.jp/' },
  },
  {
    key: 'taxFree',
    title: '면세 QR (여권 정보)',
    Icon: BagIcon,
    hint: '면세 수속용 QR(Visit Japan Web 면세 QR 등)을 등록해두세요.',
  },
];

export default function QrTab({ qr, onChange, documents, onDocumentsChange, flights }: Props) {
  const fileRefs = {
    visitJapan: useRef<HTMLInputElement>(null),
    taxFree: useRef<HTMLInputElement>(null),
  };
  const docFileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  const addDocument = async (file: File) => {
    setError(null);
    try {
      const image = await compressImage(file, 1400, 0.8);
      const title = file.name.replace(/\.[^.]+$/, '') || '문서';
      onDocumentsChange([...documents, { id: crypto.randomUUID(), title, image }]);
    } catch {
      setError('이미지를 불러오지 못했어요. 다른 파일로 시도해주세요.');
    }
  };

  const renameDocument = (id: string, title: string) =>
    onDocumentsChange(documents.map((d) => (d.id === id ? { ...d, title } : d)));

  const removeDocument = (id: string) => {
    if (window.confirm('이 문서를 삭제할까요?')) {
      onDocumentsChange(documents.filter((d) => d.id !== id));
    }
  };

  if (zoomedImage) {
    return (
      <button
        className="fixed inset-0 z-[2000] bg-white flex items-center justify-center p-2"
        onClick={() => setZoomedImage(null)}
      >
        <img src={zoomedImage} alt="확대 보기" className="max-w-full max-h-full object-contain" />
        <span className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
          화면을 탭하면 돌아가요 · 밝기를 최대로 올리면 스캔이 잘 돼요
        </span>
      </button>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      <BoardingPass flights={flights} />

      {SLOTS.map((slot) => (
        <div key={slot.key} className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <slot.Icon className="h-4 w-4" />
              {slot.title}
            </span>
            {slot.link && (
              <a
                href={slot.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-500 hover:text-accent-600"
              >
                {slot.link.label} ↗
              </a>
            )}
          </div>

          {qr[slot.key] ? (
            <div className="bg-white">
              <button className="w-full" onClick={() => setZoomedImage(qr[slot.key])}>
                <img
                  src={qr[slot.key]!}
                  alt={`${slot.title} 이미지`}
                  className="w-full max-h-[34vh] object-contain"
                />
              </button>
              <div className="flex divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setZoomedImage(qr[slot.key])}
                  className="flex-1 py-2 inline-flex items-center justify-center gap-1 text-sm text-accent-600 dark:text-accent-500 font-medium"
                >
                  <SearchIcon className="h-4 w-4" />크게 보기
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
              className="w-full h-[26vh] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-accent-500"
            >
              <PlusIcon className="h-8 w-8" />
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

      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <FolderIcon className="h-4 w-4" />문서 보관함 (e티켓·바우처)
          </span>
          <button
            onClick={() => docFileRef.current?.click()}
            className="text-xs text-accent-500 hover:text-accent-600 font-medium"
          >
            + 문서 추가
          </button>
        </div>

        {documents.length === 0 ? (
          <button
            onClick={() => docFileRef.current?.click()}
            className="w-full py-8 flex flex-col items-center gap-1 text-gray-400 hover:text-accent-500"
          >
            <PlusIcon className="h-7 w-7" />
            <span className="text-sm">항공권·숙소 바우처 스크린샷 등록</span>
            <span className="text-xs">오프라인에서도 바로 꺼내볼 수 있어요 (5~10장 권장)</span>
          </button>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 px-3 py-2">
                <button className="shrink-0" onClick={() => setZoomedImage(doc.image)}>
                  <img
                    src={doc.image}
                    alt={doc.title}
                    className="w-14 h-14 object-cover rounded border border-black/[0.06] dark:border-white/[0.1] bg-white"
                  />
                </button>
                <input
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200"
                  value={doc.title}
                  onChange={(e) => renameDocument(doc.id, e.target.value)}
                  placeholder="문서 이름"
                />
                <button
                  onClick={() => setZoomedImage(doc.image)}
                  className="shrink-0 text-accent-500"
                >
                  <SearchIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="shrink-0 text-sm text-gray-300 hover:text-rose-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={docFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addDocument(file);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}
      <p className="text-center text-xs text-gray-400">
        등록한 QR·문서는 이 기기에만 저장되고 오프라인에서도 열려요. 공항에서는 크게 보기로 띄워서 스캔받으세요.
      </p>
    </div>
  );
}
