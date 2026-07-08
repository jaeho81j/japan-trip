// 화면에 표시되는 앱 버전. 새 디자인/기능을 배포할 때마다 숫자를 올린다.
// 이 값이 기기 화면에 그대로 보이면 = 최신 버전을 받은 것.
export const APP_VERSION = 'r61';
export const APP_VERSION_LABEL = 'r61 · 새 디자인';

// 서비스워커/캐시를 모두 지우고 새로고침한다. (localStorage 여행 데이터는 건드리지 않음)
export async function forceUpdate(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    // 캐시 우회를 위해 쿼리스트링을 붙여 강제 재요청
    location.replace(location.pathname + '?u=' + APP_VERSION);
  }
}
