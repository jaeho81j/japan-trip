import type { TripData } from './types';

export const defaultData: TripData = {
  trip: {
    destination: '일본',
    startDate: '',
    endDate: '',
    currency: 'JPY',
  },
  itinerary: [],
  journal: [],
  packing: [
    { id: crypto.randomUUID(), name: '여권', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '여권 사본/사진', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '항공권/e-티켓', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '숙소 예약 확인서', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '해외 유심/이심', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '엔화 현금', category: '금전', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '해외결제 카드', category: '금전', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '멀티 어댑터(콘센트)', category: '전자기기', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '보조배터리', category: '전자기기', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '충전 케이블', category: '전자기기', qty: 2, packed: false },
    { id: crypto.randomUUID(), name: '상비약', category: '위생/건강', qty: 1, packed: false },
  ],
  budget: [],
  weather: {
    city: '도쿄',
    lat: 35.6762,
    lng: 139.6503,
    fetchedAt: null,
    daily: [],
  },
  shopping: [
    { id: crypto.randomUUID(), name: '돈키호테 기념품', category: '기념품', store: '', price: 0, bought: false, taxFree: true },
    { id: crypto.randomUUID(), name: '약국 파스/동전파스', category: '약/화장품', store: '', price: 0, bought: false, taxFree: true },
    { id: crypto.randomUUID(), name: '면세용 여권', category: '체크리스트', store: '', price: 0, bought: false, taxFree: false },
  ],
};
