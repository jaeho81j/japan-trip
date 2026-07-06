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
    // 필수 서류
    { id: crypto.randomUUID(), name: '여권', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '여권 사본/사진', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '항공권/e-티켓', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '숙소 예약 확인서', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '해외 유심/이심', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '여행자보험 증서', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: 'JR패스/교통패스 바우처', category: '필수 서류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '국제운전면허증(렌트카 시)', category: '필수 서류', qty: 1, packed: false },
    // 금전
    { id: crypto.randomUUID(), name: '엔화 현금', category: '금전', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '해외결제 카드(트래블카드 등)', category: '금전', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '동전 지갑', category: '금전', qty: 1, packed: false },
    // 전자기기
    { id: crypto.randomUUID(), name: '멀티탭', category: '전자기기', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '보조배터리', category: '전자기기', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '충전 케이블', category: '전자기기', qty: 2, packed: false },
    { id: crypto.randomUUID(), name: '카메라/여분 배터리·메모리카드', category: '전자기기', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '이어폰/헤드폰', category: '전자기기', qty: 1, packed: false },
    // 의류
    { id: crypto.randomUUID(), name: '여벌 속옷/양말', category: '의류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '편한 신발(많이 걸어요)', category: '의류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '얇은 겉옷/가디건', category: '의류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '우산/우비', category: '의류', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '잠옷', category: '의류', qty: 1, packed: false },
    // 위생/건강
    { id: crypto.randomUUID(), name: '감기약/진통제', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '지사제/소화제', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '멀미약', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '칫솔/치약', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '콘택트렌즈/안경/렌즈용품', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '생리용품', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '손소독제/물티슈', category: '위생/건강', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '마스크', category: '위생/건강', qty: 1, packed: false },
    // 화장품/뷰티
    { id: crypto.randomUUID(), name: '선크림', category: '화장품/뷰티', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '기초화장품 소분', category: '화장품/뷰티', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '헤어 제품/고데기', category: '화장품/뷰티', qty: 1, packed: false },
    // 일본여행 특화
    { id: crypto.randomUUID(), name: '접이식 에코백(비닐봉투 유료)', category: '일본여행 특화', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '온천용 수건/수영복(료칸 이용 시)', category: '일본여행 특화', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '슬리퍼(료칸/실내용)', category: '일본여행 특화', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '휴대용 손선풍기/핫팩(계절용)', category: '일본여행 특화', qty: 1, packed: false },
    // 기타
    { id: crypto.randomUUID(), name: '목베개/안대/귀마개', category: '기타', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '보조가방(크로스백/힙색)', category: '기타', qty: 1, packed: false },
    { id: crypto.randomUUID(), name: '필기구/메모지', category: '기타', qty: 1, packed: false },
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
