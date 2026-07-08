import { useRef, useState } from 'react';
import { MOODS, type JournalEntry } from '../types';
import { compressImage } from '../imageUtils';

type Props = {
  entries: JournalEntry[];
  onChange: (entries: JournalEntry[]) => void;
};

const MAX_PHOTOS = 3;

export default function JournalTab({ entries, onChange }: Props) {
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const add = () => {
    if (!text.trim() && photos.length === 0) return;
    onChange([
      { id: crypto.randomUUID(), date, text: text.trim(), mood, photos },
      ...entries,
    ]);
    setText('');
    setPhotos([]);
  };

  const attachPhotos = async (files: FileList) => {
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);
    const compressed = await Promise.all(picked.map((f) => compressImage(f, 900, 0.75).catch(() => null)));
    setPhotos([...photos, ...compressed.filter((p): p is string => p != null)]);
  };

  const remove = (id: string) => onChange(entries.filter((e) => e.id !== id));

  const sorted = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (zoomedImage) {
    return (
      <button
        className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-2"
        onClick={() => setZoomedImage(null)}
      >
        <img src={zoomedImage} alt="사진 확대" className="max-w-full max-h-full object-contain" />
        <span className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
          화면을 탭하면 돌아가요
        </span>
      </button>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex gap-1 ml-auto">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-xl px-1 rounded ${mood === m ? 'bg-accent-100 dark:bg-accent-900' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="w-full bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-2 text-sm min-h-20 text-gray-900 dark:text-gray-100"
          placeholder="오늘 하루는 어땠나요?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {photos.length > 0 && (
          <div className="flex gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p} alt={`첨부 ${i + 1}`} className="w-16 h-16 object-cover rounded" />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white text-xs leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => photoRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 disabled:opacity-40"
          >
            📷 사진 ({photos.length}/{MAX_PHOTOS})
          </button>
          <button
            onClick={add}
            className="flex-1 rounded-lg bg-accent-600 text-white py-2 text-sm font-medium hover:bg-accent-700"
          >
            기록 남기기
          </button>
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) attachPhotos(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">아직 작성된 일지가 없어요.</p>
      )}

      <div className="space-y-3">
        {sorted.map((e) => (
          <div key={e.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>
                {e.mood} {e.date || '날짜 미지정'}
              </span>
              <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-rose-500">
                삭제
              </button>
            </div>
            {e.text && (
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm text-left">
                {e.text}
              </p>
            )}
            {e.photos && e.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {e.photos.map((p, i) => (
                  <button key={i} onClick={() => setZoomedImage(p)}>
                    <img
                      src={p}
                      alt={`일지 사진 ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
