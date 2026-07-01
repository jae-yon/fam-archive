import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/date';

const recentPostsMock = [
  {
    id: 'uuid-1',
    category: {
      label: '날씨',
      color: 'blue'
    },
    title: '강서구 등 서울 서남권에 호우주의보 해제',
    content: '기상청은 강서구 등 서울 서남권에 발령했던 호우주의보를 1일 오후 6시 20분을 기해 해제한다고 밝혔다. 특보 지역은 강서구, 관악구, 양천구, 구로구, 동작구, 영등포구, 금천구(서남권)다.',
    createdAt: '2026-06-01 12:00:00',
  },
  {
    id: 'uuid-2',
    category: {
      label: '문화',
      color: 'green'
    },
    title: '보석처럼 빛나는 눈동자 속 원더랜드…이사라 개인전',
    content: '별과 하트, 꽃무늬가 빼곡히 들어찬 보석 같은 눈동자가 관람객을 바라본다. 커다란 눈 속에는 형형색색의 문양이 촘촘히 쌓여 마치 또 하나의 작은 가족이 펼쳐진 듯하다. 이사라의 작품 세계는 사실주의 회화에서 출발해 인간 내면에 대한 탐구와 어린 시절에 대한 동경을 거쳐 "원더랜드"라는 자신만의 유토피아적 서사로 발전했다.',
    createdAt: '2026-06-26 10:00:00',
  },
  {
    id: 'uuid-3',
    category: {
      label: '경제',
      color: 'yellow'
    },
    title: '올해 4%대 성장 전망도 등장…수출 月1천억달러 돌파에 기대감↑(종합)',
    content: '국내외 11기관 3%대 전망…반도체 특수에 대규모 투자·추경 가능성 등 반영 수출액 최대 기록했지만 물량은 석달째 감소…"취약부문·내수도 신경써야" 지난달 수출이 사상 최대 실적을 갈아치우면서 경제 성장에 대한 기대감이 더욱 커지고 있다. 반도체 호황에 힘입어 실질 국내총생산(GDP) 성장률이 4%에 달할 것이라는 전망도 등장했다.',
    createdAt: '2026-05-26 10:00:00',
  },
  {
    id: 'uuid-4',
    category: {
      label: '게임',
      color: 'red'
    },
    title: '크래프톤, "서브노티카" 언노운월즈와 합의…소송 마무리',
    content: '국내 게임사 크래프톤[259960]과 "서브노티카" 시리즈를 개발한 미국 자회사 언노운월즈 전직 경영진 간에 성과급 지급을 놓고 벌어진 소송이 양측 합의로 마무리됐다. 크래프톤은 1일 언노운월즈 전 주주대표 측이 미국 델라웨어 형평법 법원에 제기한 소송이 당사자 간 합의에 따른 소 취하로 종결됐다고 공시했다. 언노운월즈는 크래프톤이 2021년 5억 달러를 들여 인수한 미국 소재 게임 개발사다. 2018년 정식 출시한 해양 어드벤처 게임 "서브노티카"가 해외에서 높은 인기를 얻으며 인지도를 높여왔다.',
    createdAt: '2026-05-26 18:00:00',
  },
  {
    id: 'uuid-5',
    category: {
      label: '스포츠',
      color: 'purple'
    },
    title: '이태호 코치, 아시아 축구 연맹 ‘감독 상’ 수상…K리그 최초',
    content: '이태호 코치가 2026년 아시아 축구 연맹(AFC) 감독 상을 수상했다. 이태호 코치는 2026년 아시아 축구 연맹(AFC) 감독 상을 수상했다. 이태호 코치는 2026년 아시아 축구 연맹(AFC) 감독 상을 수상했다.',
    createdAt: '2026-05-27 10:00:00',
  },
  {
    id: 'uuid-6',
    category: {
      label: '연예',
      color: 'pink'
    },
    title: '열등감·질투 파고든 심리극…"맨 끝줄 소년"이 쓴 문학적 스릴러',
    content: '스페인 희곡 원작 넷플릭스 6부작…최민식·최현욱 조합, 밀고 당기는 호흡 호평 "글 쓰고 읽는 행위로 풀어낸 서스펜스…액자식 구성, 심리전 밀도 있게 그려" 학생들의 과제에 "쓰레기"라는 혹평을 쏟아내던 교수는 우연히 한 학생의 재능에 매료된다. 이 학생은 교수의 수업 내용 오류도 대범하게 지적하고, 과제에 "다음에 계속…"이라고 궁금증을 남겨두는 매혹적인 글도 써낸다. 교수는 "재능은 귀한 것"이라고 학생에게 은밀한 개인 수업을 제안한다.',
    createdAt: '2026-04-03 15:00:00',
  },
];

/**
 * 최근 게시글 목록 조회
 * @param posts - 게시글 목록
 * @param limit - 최대 노출 게시글 수
 * @returns 최근 게시글 목록
 */
function getRecentPosts(posts: typeof recentPostsMock, limit = 5) {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function Board() {
  const recentPosts = getRecentPosts(recentPostsMock);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight ps-2">최근 게시글</h1>
        <div className="flex flex-wrap gap-2">
          <Button>게시글 작성</Button>
          <Button variant="outline">전체 목록 보기</Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {recentPosts.map((post) => (
          <Card key={post.id} className="shadow-none border border-zinc-50 bg-none hover:border-zinc-200 hover:shadow-xs hover:bg-zinc-50 transition-all duration-300 cursor-default">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-500 tracking-wider">
                  {post.category.label}
                </span>
                <CardDescription>{formatDate(post.createdAt)}</CardDescription>
              </div>
              <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-1 text-muted-foreground">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
