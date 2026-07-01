/**
 * 날짜 포맷팅
 * @param dateString - 날짜 문자열
 * @returns 날짜 문자열
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
