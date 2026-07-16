import { useState } from 'react';
import { TOKYO_LINES } from '../tokyoLines';

// 자체 제작 도쿄 노선도 (야마노테 + 긴자·마루노우치·히비야선).
// 외부 이미지 대신 SVG로 그려서 오프라인·다크모드·한글 역명을 모두 지원한다.
// 좌표는 실제 지리를 단순화한 스케매틱 배치.

type Pos = {
  x: number;
  y: number;
  // 라벨 위치: r(오른쪽)·l(왼쪽)·t(위)·b(아래) + 대각
  label?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl';
};

const P: Record<string, Pos> = {
  // ── JR 야마노테선 (반시계, 도쿄→우에노→이케부쿠로→신주쿠→시나가와→) ──
  東京: { x: 700, y: 545, label: 'l' },
  神田: { x: 700, y: 500, label: 'r' },
  秋葉原: { x: 700, y: 455, label: 'l' },
  御徒町: { x: 700, y: 410, label: 'l' },
  上野: { x: 700, y: 365, label: 'l' },
  鶯谷: { x: 688, y: 318, label: 'l' },
  日暮里: { x: 662, y: 278, label: 'l' },
  西日暮里: { x: 628, y: 246, label: 'l' },
  田端: { x: 585, y: 222, label: 't' },
  駒込: { x: 523, y: 208, label: 't' },
  巣鴨: { x: 465, y: 204, label: 't' },
  大塚: { x: 405, y: 210, label: 't' },
  池袋: { x: 340, y: 228, label: 'tl' },
  目白: { x: 312, y: 275, label: 'l' },
  高田馬場: { x: 300, y: 322, label: 'l' },
  新大久保: { x: 296, y: 368, label: 'l' },
  新宿: { x: 295, y: 415, label: 'bl' },
  代々木: { x: 297, y: 462, label: 'l' },
  原宿: { x: 303, y: 510, label: 'l' },
  渋谷: { x: 313, y: 560, label: 'l' },
  恵比寿: { x: 332, y: 610, label: 'l' },
  目黒: { x: 362, y: 655, label: 'l' },
  五反田: { x: 402, y: 692, label: 'bl' },
  大崎: { x: 450, y: 718, label: 'bl' },
  品川: { x: 510, y: 730, label: 'b' },
  高輪ゲートウェイ: { x: 566, y: 722, label: 'br' },
  田町: { x: 615, y: 700, label: 'b' },
  浜松町: { x: 655, y: 668, label: 'br' },
  新橋: { x: 683, y: 632, label: 'br' },
  有楽町: { x: 700, y: 590, label: 'l' },
  // ── 긴자선 (시부야→아사쿠사) ──
  表参道: { x: 372, y: 540, label: 'b' },
  外苑前: { x: 415, y: 525, label: 'b' },
  青山一丁目: { x: 455, y: 512, label: 'tl' },
  赤坂見附: { x: 505, y: 495, label: 'r' },
  溜池山王: { x: 540, y: 520, label: 'r' },
  虎ノ門: { x: 578, y: 543, label: 'tr' },
  銀座: { x: 750, y: 595, label: 'br' },
  京橋: { x: 767, y: 560, label: 'r' },
  日本橋: { x: 774, y: 525, label: 'r' },
  三越前: { x: 760, y: 505, label: 'r' },
  末広町: { x: 740, y: 447, label: 'r' },
  上野広小路: { x: 740, y: 410, label: 'r' },
  稲荷町: { x: 760, y: 340, label: 'br' },
  田原町: { x: 800, y: 315, label: 'br' },
  浅草: { x: 840, y: 292, label: 'r' },
  // ── 마루노우치선 (오기쿠보→이케부쿠로) ──
  荻窪: { x: 92, y: 582, label: 'l' },
  南阿佐ケ谷: { x: 120, y: 558, label: 'l' },
  新高円寺: { x: 148, y: 534, label: 'l' },
  東高円寺: { x: 176, y: 510, label: 'l' },
  新中野: { x: 204, y: 486, label: 'l' },
  中野坂上: { x: 232, y: 462, label: 'l' },
  西新宿: { x: 262, y: 438, label: 'l' },
  新宿三丁目: { x: 338, y: 430, label: 't' },
  新宿御苑前: { x: 378, y: 445, label: 'b' },
  四谷三丁目: { x: 418, y: 459, label: 't' },
  四ツ谷: { x: 458, y: 473, label: 'b' },
  国会議事堂前: { x: 528, y: 545, label: 'bl' },
  霞ケ関: { x: 600, y: 560, label: 'b' },
  大手町: { x: 672, y: 512, label: 'l' },
  淡路町: { x: 662, y: 468, label: 'bl' },
  御茶ノ水: { x: 632, y: 428, label: 'bl' },
  本郷三丁目: { x: 598, y: 388, label: 'bl' },
  後楽園: { x: 552, y: 348, label: 'bl' },
  茗荷谷: { x: 496, y: 308, label: 'bl' },
  新大塚: { x: 432, y: 268, label: 'bl' },
  // ── 히비야선 (나카메구로→키타센주) ──
  中目黒: { x: 282, y: 648, label: 'l' },
  広尾: { x: 390, y: 592, label: 'b' },
  六本木: { x: 442, y: 572, label: 'b' },
  神谷町: { x: 492, y: 578, label: 'b' },
  虎ノ門ヒルズ: { x: 545, y: 585, label: 'b' },
  日比谷: { x: 655, y: 575, label: 't' },
  東銀座: { x: 788, y: 610, label: 'b' },
  築地: { x: 825, y: 622, label: 'br' },
  八丁堀: { x: 848, y: 585, label: 'r' },
  茅場町: { x: 852, y: 540, label: 'r' },
  人形町: { x: 848, y: 495, label: 'r' },
  小伝馬町: { x: 830, y: 452, label: 'r' },
  仲御徒町: { x: 716, y: 410, label: 'b' },
  入谷: { x: 722, y: 322, label: 't' },
  三ノ輪: { x: 756, y: 286, label: 't' },
  南千住: { x: 790, y: 250, label: 't' },
  北千住: { x: 824, y: 214, label: 'r' },
};

// 두 개 이상 노선이 지나는 역(일본어 이름 기준) = 환승역 링 표시
const transferSet = (() => {
  const count = new Map<string, number>();
  for (const line of TOKYO_LINES)
    for (const st of line.stations) count.set(st.ja, (count.get(st.ja) || 0) + 1);
  return new Set([...count.entries()].filter(([, n]) => n >= 2).map(([ja]) => ja));
})();

// Catmull-Rom → Bezier 근사로 부드러운 경로 생성 (closed=야마노테 루프)
function smoothPath(pts: { x: number; y: number }[], closed: boolean, tension = 6): string {
  if (pts.length < 2) return '';
  const p = (i: number) => pts[closed ? (i + pts.length) % pts.length : Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M ${p(0).x} ${p(0).y}`;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / tension;
    const c1y = p1.y + (p2.y - p0.y) / tension;
    const c2x = p2.x - (p3.x - p1.x) / tension;
    const c2y = p2.y - (p3.y - p1.y) / tension;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  if (closed) d += ' Z';
  return d;
}

function labelAttrs(pos: Pos): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const off = 10;
  switch (pos.label ?? 'r') {
    case 'l':
      return { x: pos.x - off, y: pos.y + 3.5, anchor: 'end' };
    case 't':
      return { x: pos.x, y: pos.y - off, anchor: 'middle' };
    case 'b':
      return { x: pos.x, y: pos.y + off + 7, anchor: 'middle' };
    case 'tr':
      return { x: pos.x + off - 2, y: pos.y - off + 3, anchor: 'start' };
    case 'tl':
      return { x: pos.x - off + 2, y: pos.y - off + 3, anchor: 'end' };
    case 'br':
      return { x: pos.x + off - 2, y: pos.y + off + 4, anchor: 'start' };
    case 'bl':
      return { x: pos.x - off + 2, y: pos.y + off + 4, anchor: 'end' };
    default:
      return { x: pos.x + off, y: pos.y + 3.5, anchor: 'start' };
  }
}

const ZOOMS = [1, 1.4, 1.9] as const;

export default function SubwayMapSvg() {
  const [zoom, setZoom] = useState(0);

  const yamanote = TOKYO_LINES.find((l) => l.id === 'yamanote')!;
  const metros = TOKYO_LINES.filter((l) => l.id !== 'yamanote');

  const lineStations = (lineId: string) =>
    TOKYO_LINES.find((l) => l.id === lineId)!.stations.map((s) => ({ ...s, pos: P[s.ja] })).filter((s) => s.pos);

  // 역 마커·라벨은 노선 중복 없이 한 번씩만
  const seen = new Set<string>();
  const allStations: { ja: string; ko: string; pos: Pos; color: string }[] = [];
  for (const line of TOKYO_LINES)
    for (const st of line.stations) {
      if (seen.has(st.ja) || !P[st.ja]) continue;
      seen.add(st.ja);
      allStations.push({ ja: st.ja, ko: st.ko, pos: P[st.ja], color: line.color });
    }

  const width = 620 * ZOOMS[zoom];

  return (
    <div>
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          {TOKYO_LINES.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1 text-[10.5px] text-gray-500 dark:text-gray-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.nameKo}
            </span>
          ))}
        </div>
        <button
          onClick={() => setZoom((z) => (z + 1) % ZOOMS.length)}
          className="shrink-0 rounded-lg border border-black/[0.08] dark:border-white/[0.12] px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400"
        >
          🔍 {ZOOMS[zoom]}x
        </button>
      </div>

      <div className="overflow-auto max-h-[58vh]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <svg
          viewBox="30 160 900 610"
          style={{ width, minWidth: '100%' }}
          className="block select-none"
          role="img"
          aria-label="도쿄 지하철 노선도 (야마노테선·긴자선·마루노우치선·히비야선, 한글)"
        >
          {/* 노선 */}
          <path
            d={smoothPath(yamanote.stations.map((s) => P[s.ja]), true)}
            fill="none"
            stroke={yamanote.color}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          {metros.map((line) => (
            <path
              key={line.id}
              d={smoothPath(lineStations(line.id).map((s) => s.pos), false, 9)}
              fill="none"
              stroke={line.color}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* 역 마커 */}
          {allStations.map((st) =>
            transferSet.has(st.ja) ? (
              <circle
                key={st.ja}
                cx={st.pos.x}
                cy={st.pos.y}
                r={6}
                className="fill-white dark:fill-[#1C1C1E] stroke-gray-700 dark:stroke-gray-300"
                strokeWidth={2.4}
              />
            ) : (
              <circle
                key={st.ja}
                cx={st.pos.x}
                cy={st.pos.y}
                r={3.4}
                className="fill-white dark:fill-[#1C1C1E]"
                stroke={st.color}
                strokeWidth={2}
              />
            ),
          )}

          {/* 한글 역명 */}
          {allStations.map((st) => {
            const a = labelAttrs(st.pos);
            const major = transferSet.has(st.ja);
            return (
              <text
                key={`t-${st.ja}`}
                x={a.x}
                y={a.y}
                textAnchor={a.anchor}
                fontSize={major ? 12 : 10.5}
                fontWeight={major ? 700 : 500}
                paintOrder="stroke"
                strokeWidth={3}
                strokeLinejoin="round"
                className="fill-gray-700 dark:fill-gray-200 stroke-white dark:stroke-[#1C1C1E]"
              >
                {st.ko.replace(/\(.*?\)/g, '')}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
