// 도쿄권 연례 축제·불꽃놀이·시즌 이벤트 큐레이션.
// 날짜가 거의 고정이거나(마츠리) 규칙적인(불꽃놀이=특정 주 토요일) 것 위주.
// 실제 개최일은 해마다 조금씩 달라질 수 있어 각 항목에 '정확한 날짜 확인' 링크를 제공한다.

export type TokyoEvent = {
  id: string;
  name: string;
  area: string;
  category: '마츠리' | '불꽃놀이' | '시즌' | '전통';
  approx: string; // 사람이 읽는 예년 기준 표기
  desc: string;
  // 해당 연도의 대략적 개최 구간 (ISO yyyy-mm-dd)
  dates: (year: number) => { start: string; end: string };
  verifyQuery: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

// 그 달의 n번째 특정 요일(weekday: 0=일 … 6=토). nth: 1~4 또는 -1(마지막)
function nthWeekday(year: number, month: number, weekday: number, nth: number): number {
  if (nth === -1) {
    const last = new Date(year, month, 0).getDate(); // 그 달 마지막 날
    for (let d = last; d > 0; d--) {
      if (new Date(year, month - 1, d).getDay() === weekday) return d;
    }
    return last;
  }
  let count = 0;
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) {
    if (new Date(year, month - 1, d).getDay() === weekday) {
      count++;
      if (count === nth) return d;
    }
  }
  return 1;
}

const fixed = (fromM: number, fromD: number, toM: number, toD: number) => (y: number) => ({
  start: iso(y, fromM, fromD),
  end: iso(y, toM, toD),
});

export const TOKYO_EVENTS: TokyoEvent[] = [
  // ── 여름 (7–8월) ──
  {
    id: 'hoozuki',
    name: '아사쿠사 호오즈키이치 (꽈리 시장)',
    area: '센소지 (아사쿠사)',
    category: '전통',
    approx: '7월 9–10일',
    desc: '센소지 경내에 꽈리 노점이 늘어서는 여름 풍물시. 이 이틀 참배는 4만6천일 참배와 같다고 전해져요.',
    dates: fixed(7, 9, 7, 10),
    verifyQuery: '浅草 ほおずき市 2026 日程',
  },
  {
    id: 'mitama',
    name: '미타마 마츠리',
    area: '야스쿠니 신사',
    category: '마츠리',
    approx: '7월 13–16일',
    desc: '3만 개가 넘는 노란 등불이 참도를 밝히는 도쿄의 대표 여름 등불 축제. 노점·봉오도리도 함께 열려요.',
    dates: fixed(7, 13, 7, 16),
    verifyQuery: 'みたままつり 靖国神社 2026 日程',
  },
  {
    id: 'sumida-hanabi',
    name: '스미다가와 불꽃놀이',
    area: '스미다가와 (아사쿠사·오시아게)',
    category: '불꽃놀이',
    approx: '7월 마지막 토요일',
    desc: '약 2만 발이 터지는 도쿄 최대급 불꽃놀이. 스카이트리와 함께 보는 명소예요. 인파가 매우 많으니 일찍 자리잡기 권장.',
    dates: (y) => {
      const d = nthWeekday(y, 7, 6, -1); // 7월 마지막 토요일
      return { start: iso(y, 7, d), end: iso(y, 7, d) };
    },
    verifyQuery: '隅田川花火大会 2026 日程',
  },
  {
    id: 'katsushika-hanabi',
    name: '카츠시카 노료 불꽃놀이',
    area: '시바마타 (에도가와 강변)',
    category: '불꽃놀이',
    approx: '7월 하순',
    desc: '관객과 가까운 거리에서 터져 박력 있는 불꽃놀이. 스미다보다 덜 붐벼요.',
    dates: (y) => {
      const d = nthWeekday(y, 7, 2, 4); // 대략 7월 넷째 화요일 전후
      return { start: iso(y, 7, Math.max(1, d - 1)), end: iso(y, 7, Math.max(1, d - 1)) };
    },
    verifyQuery: '葛飾納涼花火大会 2026 日程',
  },
  {
    id: 'jingu-hanabi',
    name: '진구가이엔 불꽃놀이',
    area: '메이지진구 가이엔 (아오야마)',
    category: '불꽃놀이',
    approx: '8월 중순',
    desc: '도심 한복판에서 열리는 불꽃놀이. 유료 관람석(구장·경기장)에서 편하게 볼 수 있어요.',
    dates: fixed(8, 15, 8, 17),
    verifyQuery: '神宮外苑花火大会 2026 日程',
  },
  {
    id: 'koenji-awa',
    name: '코엔지 아와오도리',
    area: '코엔지',
    category: '마츠리',
    approx: '8월 마지막 주말',
    desc: '1만 명의 춤꾼이 거리를 메우는 도쿄 최대 아와오도리. 활기찬 여름의 피날레예요.',
    dates: (y) => {
      const sat = nthWeekday(y, 8, 6, -1);
      return { start: iso(y, 8, sat - 1), end: iso(y, 8, sat) };
    },
    verifyQuery: '東京高円寺阿波おどり 2026 日程',
  },
  {
    id: 'asagaya-tanabata',
    name: '아사가야 타나바타 마츠리',
    area: '아사가야',
    category: '마츠리',
    approx: '8월 상순',
    desc: '상점가 아케이드를 거대한 종이 장식이 뒤덮는 칠석 축제. 아기자기한 볼거리가 많아요.',
    dates: fixed(8, 5, 8, 11),
    verifyQuery: '阿佐谷七夕まつり 2026 日程',
  },
  {
    id: 'obon',
    name: '오봉 (お盆) 시즌',
    area: '일본 전역',
    category: '시즌',
    approx: '8월 13–16일',
    desc: '조상을 기리는 명절. 이 시기 신칸센·항공·숙소가 매우 붐비고 비싸요. 일부 상점·식당은 휴무.',
    dates: fixed(8, 13, 8, 16),
    verifyQuery: 'お盆 2026 期間',
  },

  // ── 봄 ──
  {
    id: 'sakura',
    name: '벚꽃 시즌 (하나미)',
    area: '우에노·신주쿠교엔·메구로강·치도리가후치',
    category: '시즌',
    approx: '3월 하순–4월 상순',
    desc: '도쿄 벚꽃 만개는 보통 3월 말~4월 초. 개화는 해마다 달라지니 개화 예보 확인 필수.',
    dates: fixed(3, 22, 4, 7),
    verifyQuery: '東京 桜 開花 2026 予想',
  },
  {
    id: 'sanja',
    name: '산자 마츠리',
    area: '아사쿠사 신사',
    category: '마츠리',
    approx: '5월 셋째 주말',
    desc: '100기 넘는 미코시(가마)가 아사쿠사를 누비는 에도 3대 축제. 200만 명이 몰리는 초대형 마츠리.',
    dates: (y) => {
      const fri = nthWeekday(y, 5, 5, 3);
      return { start: iso(y, 5, fri), end: iso(y, 5, fri + 2) };
    },
    verifyQuery: '三社祭 2026 日程',
  },

  // ── 가을·겨울 ──
  {
    id: 'koyo',
    name: '단풍 시즌 (코요)',
    area: '고쿄가이엔·리쿠기엔·이초나미키',
    category: '시즌',
    approx: '11월 하순–12월 상순',
    desc: '도쿄 단풍 절정은 대체로 11월 말~12월 초. 리쿠기엔·메이지진구 가이엔 은행나무길이 유명해요.',
    dates: fixed(11, 20, 12, 7),
    verifyQuery: '東京 紅葉 見頃 2026',
  },
  {
    id: 'illumi',
    name: '겨울 일루미네이션',
    area: '마루노우치·시부야·롯폰기·에비스',
    category: '시즌',
    approx: '11월–1월',
    desc: '겨울철 도쿄 곳곳이 조명으로 물들어요. 마루노우치 나카도리, 롯폰기 케야키자카가 대표적.',
    dates: fixed(11, 10, 1, 10),
    verifyQuery: '東京 イルミネーション 2026 2027',
  },
  {
    id: 'hatsumode',
    name: '하츠모데 (새해 첫 참배)',
    area: '메이지신궁·센소지·간다묘진',
    category: '전통',
    approx: '1월 1–3일',
    desc: '새해 첫 신사·절 참배. 메이지신궁은 사흘간 수백만 명이 찾아요. 노점·행운 뽑기도 즐길 수 있어요.',
    dates: fixed(1, 1, 1, 3),
    verifyQuery: '初詣 東京 2026',
  },
];

// 상설 박물관·미술관 (날짜 없이 항상 표시). 개장/휴관/요금은 바뀔 수 있어 확인 링크 제공.
export type TokyoSpot = {
  id: string;
  name: string;
  area: string;
  category: '박물관' | '미술관' | '체험';
  desc: string;
  hours: string;
  closed: string;
  searchQuery: string;
  mapQuery: string;
};

export const TOKYO_MUSEUMS: TokyoSpot[] = [
  {
    id: 'tnm',
    name: '도쿄 국립박물관',
    area: '우에노 공원',
    category: '박물관',
    desc: '일본 최대 규모의 박물관. 국보·중요문화재 등 도자기·불상·사무라이 갑옷·우키요에를 볼 수 있어요.',
    hours: '대체로 9:30–17:00',
    closed: '월요일 휴관(공휴일이면 다음 평일)',
    searchQuery: '東京国立博物館 開館時間 料金',
    mapQuery: '東京国立博物館',
  },
  {
    id: 'nmwa',
    name: '국립 서양미술관',
    area: '우에노 공원',
    category: '미술관',
    desc: '르코르뷔지에가 설계한 세계문화유산 건물. 모네·로댕 등 서양 근대 명작을 소장.',
    hours: '대체로 9:30–17:30 (금·토 야간연장)',
    closed: '월요일 휴관',
    searchQuery: '国立西洋美術館 開館時間 料金',
    mapQuery: '国立西洋美術館',
  },
  {
    id: 'kahaku',
    name: '국립 과학박물관',
    area: '우에노 공원',
    category: '박물관',
    desc: '공룡 화석·자연사·일본 과학기술 전시. 아이와 함께 가기 좋아요.',
    hours: '대체로 9:00–17:00',
    closed: '월요일 휴관',
    searchQuery: '国立科学博物館 開館時間 料金',
    mapQuery: '国立科学博物館',
  },
  {
    id: 'mori',
    name: '모리미술관',
    area: '롯폰기 힐스',
    category: '미술관',
    desc: '롯폰기 힐스 53층의 현대미술관. 대체로 밤 늦게까지 열고, 도쿄 시티뷰 전망대와 함께 즐겨요.',
    hours: '대체로 10:00–22:00 (야간개장)',
    closed: '전시 교체기 외 대체로 연중무휴',
    searchQuery: '森美術館 開館時間 チケット',
    mapQuery: '森美術館 六本木ヒルズ',
  },
  {
    id: 'teamlab',
    name: 'teamLab (팀랩)',
    area: '도요스 / 아자부다이',
    category: '체험',
    desc: '몸으로 걷는 디지털 아트 체험. teamLab Planets(도요스)·Borderless(아자부다이 힐스) 두 곳. 예약 필수·인기 많음.',
    hours: '위치별 상이 · 시간지정 예약제',
    closed: '위치별 상이 (예약 사이트 확인)',
    searchQuery: 'teamLab Planets Borderless 예약 티켓',
    mapQuery: 'teamLab Planets TOKYO',
  },
  {
    id: 'nezu',
    name: '네즈미술관',
    area: '오모테산도',
    category: '미술관',
    desc: '동양 고미술 컬렉션과 도심 속 일본 정원이 아름다운 미술관. 산책하기 좋아요.',
    hours: '대체로 10:00–17:00',
    closed: '월요일 휴관',
    searchQuery: '根津美術館 開館時間 料金',
    mapQuery: '根津美術館',
  },
  {
    id: 'mot',
    name: '도쿄도 현대미술관 (MOT)',
    area: '기바 (고토구)',
    category: '미술관',
    desc: '대규모 현대미술 기획전으로 유명. 넓고 쾌적해 미술 좋아하면 강추.',
    hours: '대체로 10:00–18:00',
    closed: '월요일 휴관',
    searchQuery: '東京都現代美術館 開館時間 チケット',
    mapQuery: '東京都現代美術館',
  },
  {
    id: 'suntory',
    name: '산토리미술관',
    area: '롯폰기 (도쿄 미드타운)',
    category: '미술관',
    desc: '일본 전통 공예·회화 중심의 우아한 기획전. 도쿄 미드타운 안이라 접근성 좋아요.',
    hours: '대체로 10:00–18:00',
    closed: '화요일 휴관',
    searchQuery: 'サントリー美術館 開館時間 チケット',
    mapQuery: 'サントリー美術館 東京ミッドタウン',
  },
];

export type TripEvents = {
  during: TokyoEvent[]; // 여행 기간과 겹침
  nearby: TokyoEvent[]; // 같은 달·비슷한 시기지만 안 겹침
};

// 여행 [startISO, endISO] 기준으로 겹치는/무렵 이벤트 분류
export function eventsForTrip(startISO: string, endISO: string): TripEvents {
  const during: TokyoEvent[] = [];
  const nearby: TokyoEvent[] = [];
  if (!startISO) return { during, nearby };
  const end = endISO || startISO;
  const year = Number(startISO.slice(0, 4));
  const tripStartMonth = Number(startISO.slice(5, 7));
  const tripEndMonth = Number(end.slice(5, 7));

  for (const ev of TOKYO_EVENTS) {
    // 겹침 판정은 여행 연도와 (연말~연초 이벤트 대비) 다음 해 두 번 확인
    let overlapped = false;
    for (const y of [year, year + 1]) {
      const { start: es, end: ee } = ev.dates(y);
      if (es <= end && ee >= startISO) {
        overlapped = true;
        break;
      }
    }
    if (overlapped) {
      during.push(ev);
      continue;
    }
    const evMonth = Number(ev.dates(year).start.slice(5, 7));
    if (evMonth === tripStartMonth || evMonth === tripEndMonth) nearby.push(ev);
  }
  return { during, nearby };
}
