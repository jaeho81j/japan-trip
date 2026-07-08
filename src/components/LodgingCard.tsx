import { useState } from 'react';
import type { LodgingInfo } from '../types';
import { googleMapsSearchUrl } from '../googleMaps';

type Props = {
  lodgings: LodgingInfo[];
  onChange: (lodgings: LodgingInfo[]) => void;
};

function emptyLodging(): LodgingInfo {
  return { id: crypto.randomUUID(), name: '', addressJa: '', checkIn: '', checkOut: '', confirmation: '' };
}

function LodgingForm({
  lodging,
  onSave,
  onCancel,
}: {
  lodging: LodgingInfo;
  onSave: (l: LodgingInfo) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<LodgingInfo>(lodging);
  const set = (patch: Partial<LodgingInfo>) => setDraft({ ...draft, ...patch });

  return (
    <div className="space-y-2 px-3 py-2">
      <input
        className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
        placeholder="숙소 이름 (예: 시부야 스트림 호텔)"
        value={draft.name}
        onChange={(e) => set({ name: e.target.value })}
      />
      <textarea
        className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm min-h-14"
        placeholder="일본어 주소 (택시 기사에게 보여줄 용도) — 예약사이트에서 복사해 붙여넣으세요"
        value={draft.addressJa}
        onChange={(e) => set({ addressJa: e.target.value })}
      />
      <div className="flex items-center gap-2 text-sm">
        <label className="text-xs text-gray-400 shrink-0">체크인</label>
        <input
          type="date"
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
          value={draft.checkIn}
          onChange={(e) => set({ checkIn: e.target.value })}
        />
        <label className="text-xs text-gray-400 shrink-0">아웃</label>
        <input
          type="date"
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
          value={draft.checkOut}
          onChange={(e) => set({ checkOut: e.target.value })}
        />
      </div>
      <input
        className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
        placeholder="예약 번호 (선택)"
        value={draft.confirmation}
        onChange={(e) => set({ confirmation: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-black/[0.06] dark:border-white/[0.1] text-gray-500 py-1.5 text-sm"
        >
          취소
        </button>
        <button
          onClick={() => draft.name.trim() && onSave(draft)}
          className="flex-1 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] py-1.5 text-sm font-medium hover:bg-accent-700"
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default function LodgingCard({ lodgings, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [taxiAddress, setTaxiAddress] = useState<LodgingInfo | null>(null);

  // Full-screen Japanese address to show a taxi driver
  if (taxiAddress) {
    return (
      <button
        className="fixed inset-0 z-[2000] bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center"
        onClick={() => setTaxiAddress(null)}
      >
        <p className="text-sm text-gray-500 mb-4">🚕 이 화면을 택시 기사에게 보여주세요</p>
        <p className="text-2xl font-bold mb-2">{taxiAddress.name}</p>
        <p className="text-3xl leading-relaxed font-semibold">{taxiAddress.addressJa || '(주소 미입력)'}</p>
        <p className="text-sm text-gray-400 mt-8">화면을 탭하면 돌아가요</p>
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
      <div className="bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">🏨 숙소</span>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-accent-500 hover:text-accent-600 font-medium"
          >
            + 숙소 추가
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {lodgings.map((lodging) =>
          editingId === lodging.id ? (
            <LodgingForm
              key={lodging.id}
              lodging={lodging}
              onSave={(l) => {
                onChange(lodgings.map((x) => (x.id === l.id ? l : x)));
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={lodging.id} className="px-3 py-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 min-w-0 truncate">
                  {lodging.name}
                </span>
                <button
                  onClick={() => setEditingId(lodging.id)}
                  className="shrink-0 text-xs text-gray-400 hover:text-accent-500"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('이 숙소를 삭제할까요?')) {
                      onChange(lodgings.filter((x) => x.id !== lodging.id));
                    }
                  }}
                  className="shrink-0 text-xs text-gray-300 hover:text-rose-500"
                >
                  삭제
                </button>
              </div>
              {(lodging.checkIn || lodging.checkOut) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lodging.checkIn || '?'} ~ {lodging.checkOut || '?'}
                  {lodging.confirmation && ` · 예약 ${lodging.confirmation}`}
                </p>
              )}
              {lodging.addressJa && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{lodging.addressJa}</p>
              )}
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => setTaxiAddress(lodging)}
                  className="text-accent-500 hover:text-accent-600 font-medium"
                >
                  🚕 택시 기사에게 보여주기
                </button>
                {lodging.addressJa && (
                  <a
                    href={googleMapsSearchUrl(lodging.addressJa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-500 hover:text-accent-600"
                  >
                    지도에서 보기
                  </a>
                )}
              </div>
            </div>
          ),
        )}

        {adding && (
          <LodgingForm
            lodging={emptyLodging()}
            onSave={(l) => {
              onChange([...lodgings, l]);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {lodgings.length === 0 && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-left px-3 py-3 text-sm text-gray-400 hover:text-accent-500"
          >
            🏨 숙소 등록 (일본어 주소를 넣으면 택시에서 유용해요) +
          </button>
        )}
      </div>
    </div>
  );
}
