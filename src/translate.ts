export type LangCode = 'ko' | 'ja' | 'en';

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '일본어' },
  { code: 'en', label: '영어' },
];

export async function translateText(text: string, source: LangCode, target: LangCode): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('langpair', `${source}|${target}`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`translate failed: ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number | string;
    responseData: { translatedText: string };
  };

  if (Number(data.responseStatus) !== 200) {
    throw new Error('translate failed');
  }

  return data.responseData.translatedText;
}

export type Phrase = {
  category: string;
  ko: string;
  ja: string;
  romaji: string;
};

export const PHRASEBOOK: Phrase[] = [
  { category: '인사', ko: '안녕하세요', ja: 'こんにちは', romaji: 'Konnichiwa' },
  { category: '인사', ko: '감사합니다', ja: 'ありがとうございます', romaji: 'Arigatou gozaimasu' },
  { category: '인사', ko: '죄송합니다', ja: 'すみません', romaji: 'Sumimasen' },
  { category: '인사', ko: '실례합니다', ja: '失礼します', romaji: 'Shitsurei shimasu' },
  { category: '식당', ko: '주문할게요', ja: '注文お願いします', romaji: 'Chuumon onegaishimasu' },
  { category: '식당', ko: '이거 주세요', ja: 'これください', romaji: 'Kore kudasai' },
  { category: '식당', ko: '물 좀 주세요', ja: 'お水ください', romaji: 'Omizu kudasai' },
  { category: '식당', ko: '계산해 주세요', ja: 'お会計お願いします', romaji: 'Okaikei onegaishimasu' },
  { category: '쇼핑', ko: '이거 얼마예요?', ja: 'これいくらですか？', romaji: 'Kore ikura desu ka?' },
  { category: '쇼핑', ko: '면세 되나요?', ja: '免税できますか？', romaji: 'Menzei dekimasu ka?' },
  { category: '쇼핑', ko: '카드 되나요?', ja: 'カード使えますか？', romaji: 'Kaado tsukaemasu ka?' },
  { category: '쇼핑', ko: '다른 색 있어요?', ja: '他の色ありますか？', romaji: 'Hoka no iro arimasu ka?' },
  { category: '교통·길찾기', ko: '여기 어떻게 가요?', ja: 'ここへはどう行きますか？', romaji: 'Koko e wa dou ikimasu ka?' },
  { category: '교통·길찾기', ko: '화장실 어디예요?', ja: 'トイレはどこですか？', romaji: 'Toire wa doko desu ka?' },
  {
    category: '교통·길찾기',
    ko: '이 열차 신주쿠 가나요?',
    ja: 'この電車は新宿に行きますか？',
    romaji: 'Kono densha wa Shinjuku ni ikimasu ka?',
  },
  { category: '긴급', ko: '도와주세요', ja: '助けてください', romaji: 'Tasukete kudasai' },
  { category: '긴급', ko: '아파요', ja: '具合が悪いです', romaji: 'Guai ga warui desu' },
  { category: '긴급', ko: '병원이 어디예요?', ja: '病院はどこですか？', romaji: 'Byouin wa doko desu ka?' },
];
