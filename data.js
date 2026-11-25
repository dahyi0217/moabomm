/* ==========================================================================
   Moabom (모아봄) — Initial Sample Dataset, Natural Language Search & AI Engine
   ========================================================================== */

const MOABOM_AI_PROMPT =
  '이미지의 주요 대상, 색감, 분위기, 구성, 디자인 스타일을 분석하고 검색에 유용한 태그와 한 줄 설명을 작성해줘.';

const TAG_CATEGORIES = ['색감', '구성', '분위기', '매체'];

const INITIAL_REFERENCES = [
  {
    id: 'ref_01',
    image: 'public/sample/ref_01.webp',
    filename: 'ref_01.webp',
    title: '클래식 건축 에디토리얼 스프레드',
    projectTopic: '금융·건축 매거진 편집 디자인',
    description:
      '크림 지면 위 클래식 건축 기둥 사진과 마호가니 브라운 띠지, 2단 세리프 본문이 조화된 차분한 에디토리얼 스프레드',
    tags: {
      색감: ['#크림', '#마호가니'],
      구성: ['#2단그리드', '#여백중심'],
      분위기: ['#차분한', '#지적인'],
      매체: ['#북디자인'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:00:00+09:00',
  },
  {
    id: 'ref_02',
    image: 'public/sample/ref_02.webp',
    filename: 'ref_02.webp',
    title: '코트 컬렉션 패션 룩북',
    projectTopic: 'F/W 어패럴 브랜드 룩북',
    description:
      '버건디와 딥그린 컬러 배색 코트를 입은 모델을 석재 기둥 배경에 비대칭으로 배치한 클래식 F/W 패션 룩북',
    tags: {
      색감: ['#버건디', '#딥그린'],
      구성: ['#인물중심', '#비대칭'],
      분위기: ['#클래식', '#우아한'],
      매체: ['#룩북'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:05:00+09:00',
  },
  {
    id: 'ref_03',
    image: 'public/sample/ref_03.webp',
    filename: 'ref_03.webp',
    title: '보태니컬 아포테케리 패키지',
    projectTopic: '친환경 스킨케어 패키지 리뉴얼',
    description:
      '질감이 살아있는 아이보리 한지 라벨 유리병과 딥브라운 지기 상자, 유칼립투스 오브제가 어우러진 정갈한 보태니컬 패키지',
    tags: {
      색감: ['#아이보리', '#딥브라운'],
      구성: ['#중앙정렬', '#단일피사체'],
      분위기: ['#정갈한', '#따뜻한'],
      매체: ['#패키지'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:10:00+09:00',
  },
  {
    id: 'ref_04',
    image: 'public/sample/ref_04.webp',
    filename: 'ref_04.webp',
    title: '기하학 스위스 전시 포스터',
    projectTopic: '현대 타이포그래피 기획전 홍보',
    description:
      '웜크림 배경 위에 딥네이비와 슬레이트 톤의 원·반원 기하학 도형을 촘촘한 그리드로 교차 배치한 모던 전시 포스터',
    tags: {
      색감: ['#네이비', '#웜크림'],
      구성: ['#기하학', '#그리드'],
      분위기: ['#구조적', '#모던한'],
      매체: ['#포스터'],
    },
    status: 'draft',
    source: '내장 샘플 · AI 초안',
    picked: false,
    createdAt: '2026-11-25T09:15:00+09:00',
  },
  {
    id: 'ref_05',
    image: 'public/sample/ref_05.webp',
    filename: 'ref_05.webp',
    title: '린넨 하드커버 아트북 표지',
    projectTopic: '갤러리 아카이브 전시 도록',
    description:
      '내추럴 샌드 컬러 패브릭 린넨 양장 표지 중앙에 기하학적 음각 형압 심볼을 절제미 있게 담은 전시 도록',
    tags: {
      색감: ['#오프화이트', '#샌드'],
      구성: ['#여백중심', '#엠보싱'],
      분위기: ['#절제된', '#아카이브'],
      매체: ['#북디자인'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:20:00+09:00',
  },
  {
    id: 'ref_06',
    image: 'public/sample/ref_06.webp',
    filename: 'ref_06.webp',
    title: '건축 아카이브 웹 UI 레이아웃',
    projectTopic: '온라인 뮤지엄 큐레이션 웹',
    description:
      '파치먼트 톤 화면 위 가는 브라운 헤어라인 프레임과 비정형 건축 사진 카드 그리드, 하단 포인트 밴드로 구성된 웹 UI',
    tags: {
      색감: ['#파치먼트', '#브라운'],
      구성: ['#카드그리드', '#가로분할'],
      분위기: ['#현대적', '#깔끔한'],
      매체: ['#웹UI'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:25:00+09:00',
  },
  {
    id: 'ref_07',
    image: 'public/sample/ref_07.webp',
    filename: 'ref_07.webp',
    title: '스페셜티 커피 드립백 브랜딩',
    projectTopic: '로스터리 카페 패키지 아이덴티티',
    description:
      '테라코타 석재 테이블과 부드러운 그림자 속 크라프트 파우치, 도자기 커피잔과 원두를 자연스럽게 배치한 브랜딩 컷',
    tags: {
      색감: ['#테라코타', '#크라프트'],
      구성: ['#오브제배치', '#자연광'],
      분위기: ['#감성적', '#자연스러운'],
      매체: ['#브랜딩'],
    },
    status: 'draft',
    source: '내장 샘플 · AI 초안',
    picked: false,
    createdAt: '2026-11-25T09:30:00+09:00',
  },
  {
    id: 'ref_08',
    image: 'public/sample/ref_08.webp',
    filename: 'ref_08.webp',
    title: '브루탈리즘 콘크리트 건축 사진',
    projectTopic: '공간 브랜드 무드보드 리서치',
    description:
      '노출 콘크리트 벽면과 계단 위로 강렬한 대각선 빛과 그림자가 떨어지며 고요한 조형미를 드러내는 브루탈리즘 건축 사진',
    tags: {
      색감: ['#웜그레이', '#그림자'],
      구성: ['#대각선구도', '#건축미'],
      분위기: ['#고요한', '#웅장한'],
      매체: ['#사진'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:35:00+09:00',
  },
  {
    id: 'ref_09',
    image: 'public/sample/ref_09.webp',
    filename: 'ref_09.webp',
    title: '하프톤 추상 그래픽 아트 프린트',
    projectTopic: '뮤직 페스티벌 비주얼 아이덴티티',
    description:
      '뮤트퍼플과 머스타드 컬러의 유기적 면과 하프톤 망점 텍스처가 중첩되어 리드미컬한 에너지를 전달하는 그래픽 포스터',
    tags: {
      색감: ['#뮤트퍼플', '#머스타드'],
      구성: ['#레이어드', '#유기적형태'],
      분위기: ['#실험적', '#강렬한'],
      매체: ['#그래픽'],
    },
    status: 'draft',
    source: '내장 샘플 · AI 초안',
    picked: false,
    createdAt: '2026-11-25T09:40:00+09:00',
  },
  {
    id: 'ref_10',
    image: 'public/sample/ref_10.webp',
    filename: 'ref_10.webp',
    title: '핸드메이드 코튼 종이 텍스처',
    projectTopic: '프리미엄 지류·인쇄 후가공 참고',
    description:
      '거칠게 찢어진 데클 엣지와 천연 섬유질이 그대로 드러나는 따뜻한 파치먼트 톤 수제 코튼 종이 매크로 텍스처',
    tags: {
      색감: ['#파치먼트', '#웜톤'],
      구성: ['#질감중심', '#클로즈업'],
      분위기: ['#촉각적', '#서정적'],
      매체: ['#텍스처'],
    },
    status: 'verified',
    source: '내장 샘플 · AI 분석 검수 완료',
    picked: false,
    createdAt: '2026-11-25T09:45:00+09:00',
  },
];

/* ==========================================================================
   Natural Language Korean Search Engine
   ========================================================================== */

const NL_STOPWORDS = new Set([
  '의', '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과',
  '도', '만', '톤', '느낌', '분위기', '스타일', '디자인', '레퍼런스', '이미지', '사진',
  '찾아줘', '보여줘', '검색', '같은', '있는', '많은', '적당한', '어울리는',
]);

const NL_SYNONYM_MAP = {
  브라운: ['브라운', '마호가니', '딥브라운', '크라프트', '테라코타', '갈색', '샌드'],
  갈색: ['브라운', '마호가니', '딥브라운', '크라프트', '테라코타'],
  크림: ['크림', '웜크림', '아이보리', '파치먼트', '오프화이트', '베이지'],
  아이보리: ['아이보리', '크림', '오프화이트', '파치먼트'],
  베이지: ['샌드', '크림', '파치먼트', '오프화이트', '크라프트'],
  네이비: ['네이비', '남색', '블루', '딥네이비'],
  그린: ['딥그린', '초록', '보태니컬', '유칼립투스', '자연'],
  보라: ['뮤트퍼플', '퍼플', '바이올렛'],
  퍼플: ['뮤트퍼플', '퍼플'],
  노랑: ['머스타드', '옐로우'],
  그레이: ['웜그레이', '회색', '콘크리트', '그림자'],
  회색: ['웜그레이', '콘크리트', '그림자'],
  저채도: ['뮤트퍼플', '웜그레이', '파치먼트', '오프화이트', '샌드', '크림', '절제된', '차분한', '고요한'],
  차분한: ['차분한', '고요한', '절제된', '정갈한', '지적인', '서정적'],
  조용한: ['고요한', '차분한', '절제된'],
  따뜻한: ['따뜻한', '웜톤', '웜크림', '테라코타', '감성적', '자연스러운'],
  모던: ['모던한', '현대적', '구조적', '깔끔한', '기하학'],
  현대적: ['현대적', '모던한', '구조적', '웹UI'],
  편집: ['북디자인', '에디토리얼', '매거진', '2단그리드', '도록'],
  에디토리얼: ['에디토리얼', '북디자인', '매거진', '2단그리드'],
  책: ['북디자인', '아트북', '표지', '도록', '스프레드'],
  여백: ['여백중심', '절제된', '깔끔한'],
  그리드: ['그리드', '2단그리드', '카드그리드', '구조적'],
  패키지: ['패키지', '포장', '드립백', '라벨', '스킨케어', '브랜딩'],
  포장: ['패키지', '브랜딩', '크라프트'],
  웹: ['웹UI', '레이아웃', '큐레이션', '카드그리드'],
  포스터: ['포스터', '전시', '그래픽', '프린트'],
  종이: ['종이', '코튼', '파치먼트', '텍스처', '지류', '한지'],
  질감: ['질감중심', '텍스처', '린넨', '코튼', '촉각적'],
  건축: ['건축', '콘크리트', '브루탈리즘', '기둥', '건축미'],
  패션: ['룩북', '코트', '어패럴', '인물중심'],
  커피: ['커피', '드립백', '로스터리', '브랜딩'],
};

function normalizeToken(raw) {
  return raw
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/(은|는|이|가|을|를|의|에|로|으로|와|과|한|적|스러운)$/g, '')
    .trim();
}

function tokenizeQuery(query) {
  const cleaned = query
    .trim()
    .replace(/[.,!?'"()\[\]]/g, ' ');
  if (!cleaned) return [];
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const tokens = [];

  for (const raw of rawTokens) {
    const isHashtag = raw.startsWith('#');
    const bare = raw.replace(/^#/, '').toLowerCase();
    if (!bare) continue;
    const norm = normalizeToken(bare);
    if (!isHashtag && (NL_STOPWORDS.has(bare) || NL_STOPWORDS.has(norm))) continue;
    tokens.push({ raw: bare, norm: norm || bare, isHashtag });
  }
  return tokens;
}

function getExpandedTerms(token) {
  const terms = new Set([token.raw, token.norm]);
  for (const [key, syns] of Object.entries(NL_SYNONYM_MAP)) {
    if (token.raw.includes(key) || token.norm.includes(key) || key === token.norm) {
      syns.forEach((s) => terms.add(s.toLowerCase()));
    }
  }
  return Array.from(terms);
}

function scoreReferenceMatch(ref, query) {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return 1;

  const allTags = TAG_CATEGORIES.flatMap((cat) => ref.tags[cat] || []);
  const tagText = allTags.join(' ').toLowerCase();
  const bodyText = [
    ref.title,
    ref.projectTopic,
    ref.description,
    tagText,
  ]
    .join(' ')
    .toLowerCase();

  let matchedTokenCount = 0;
  let totalScore = 0;

  for (const token of tokens) {
    const expanded = getExpandedTerms(token);
    let tokenHit = false;
    let bestWeight = 0;

    for (const term of expanded) {
      const exactTag = allTags.some((t) => t.replace(/^#/, '').toLowerCase() === term);
      if (exactTag) {
        tokenHit = true;
        bestWeight = Math.max(bestWeight, 5);
      } else if (tagText.includes(term)) {
        tokenHit = true;
        bestWeight = Math.max(bestWeight, 3.5);
      } else if (ref.projectTopic.toLowerCase().includes(term) || ref.title.toLowerCase().includes(term)) {
        tokenHit = true;
        bestWeight = Math.max(bestWeight, 3);
      } else if (bodyText.includes(term)) {
        tokenHit = true;
        bestWeight = Math.max(bestWeight, 2);
      }
    }

    if (tokenHit) {
      matchedTokenCount += 1;
      totalScore += bestWeight;
    }
  }

  // Require strong coverage for multi-word NL queries while allowing helpful recall
  const minRequired = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.55);
  if (matchedTokenCount < minRequired) return 0;

  return totalScore + matchedTokenCount * 2;
}

/* ==========================================================================
   Image Compression & Smart Local + Gemini AI Analysis
   ========================================================================== */

function readImageAsCompressedDataUrl(file, maxDimension = 1280, quality = 0.86) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve({
          dataUrl,
          width: img.width,
          height: img.height,
          canvas,
          ctx,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function classifyRgbToKoreanTag(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  const d = (max - min) / 255;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (s < 0.14) {
    if (l > 0.88) return '#오프화이트';
    if (l > 0.72) return '#웜그레이';
    if (l > 0.38) return '#스톤그레이';
    return '#차콜';
  }

  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  if (h < 22 || h >= 335) {
    if (l < 0.34) return '#버건디';
    if (l > 0.78) return '#더스티로즈';
    return '#테라코타';
  }
  if (h < 46) {
    if (l > 0.82) return '#크림';
    if (l < 0.42) return '#마호가니';
    if (s < 0.42) return '#샌드';
    return '#크라프트';
  }
  if (h < 70) {
    if (l > 0.82) return '#아이보리';
    return '#머스타드';
  }
  if (h < 165) {
    if (l < 0.35) return '#딥그린';
    return '#세이지그린';
  }
  if (h < 250) {
    if (l < 0.36) return '#네이비';
    return '#슬레이트블루';
  }
  return '#뮤트퍼플';
}

function extractColorAndCompositionFromCanvas(canvas, origWidth, origHeight) {
  const sampleSize = 32;
  const mini = document.createElement('canvas');
  mini.width = sampleSize;
  mini.height = sampleSize;
  const mctx = mini.getContext('2d');
  mctx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
  const data = mctx.getImageData(0, 0, sampleSize, sampleSize).data;

  const counts = new Map();
  let brightnessSum = 0;
  let edgeDiffSum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    brightnessSum += (r + g + b) / 3;
    const tag = classifyRgbToKoreanTag(r, g, b);
    counts.set(tag, (counts.get(tag) || 0) + 1);
    if (i >= 4) {
      edgeDiffSum += Math.abs(r - data[i - 4]) + Math.abs(g - data[i - 3]);
    }
  }

  const sortedColors = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const colorTags = sortedColors.slice(0, 2);
  if (colorTags.length === 1) colorTags.push('#웜톤');

  const avgBrightness = brightnessSum / (sampleSize * sampleSize);
  const avgContrast = edgeDiffSum / (sampleSize * sampleSize);
  const ratio = origWidth / Math.max(1, origHeight);

  const compTags = [];
  if (ratio > 1.2) compTags.push('#가로구도');
  else if (ratio < 0.85) compTags.push('#세로구도');
  else compTags.push('#균형비율');

  if (avgContrast < 26) compTags.push('#여백중심');
  else compTags.push('#레이어드');

  const moodTags = [];
  if (avgBrightness > 175) moodTags.push('#차분한', '#정갈한');
  else if (avgBrightness < 95) moodTags.push('#깊이감있는', '#구조적');
  else moodTags.push('#모던한', '#따뜻한');

  return { colorTags, compTags, moodTags };
}

function inferMediaFromContext(projectTopic, filename) {
  const ctx = `${projectTopic} ${filename}`.toLowerCase();
  if (ctx.includes('웹') || ctx.includes('ui') || ctx.includes('앱') || ctx.includes('뮤지엄')) return ['#웹UI'];
  if (ctx.includes('패키지') || ctx.includes('스킨케어') || ctx.includes('용기') || ctx.includes('박스')) return ['#패키지'];
  if (ctx.includes('브랜딩') || ctx.includes('카페') || ctx.includes('아이덴티티') || ctx.includes('로고')) return ['#브랜딩'];
  if (ctx.includes('포스터') || ctx.includes('전시') || ctx.includes('타이포')) return ['#포스터'];
  if (ctx.includes('룩북') || ctx.includes('패션') || ctx.includes('어패럴') || ctx.includes('코트')) return ['#룩북'];
  if (ctx.includes('매거진') || ctx.includes('북') || ctx.includes('도록') || ctx.includes('편집')) return ['#북디자인'];
  if (ctx.includes('종이') || ctx.includes('지류') || ctx.includes('질감') || ctx.includes('텍스처')) return ['#텍스처'];
  if (ctx.includes('사진') || ctx.includes('건축') || ctx.includes('공간')) return ['#사진'];
  return ['#그래픽'];
}

function analyzeImageLocally(file, canvasInfo, projectTopic) {
  const { colorTags, compTags, moodTags } = extractColorAndCompositionFromCanvas(
    canvasInfo.canvas,
    canvasInfo.width,
    canvasInfo.height
  );
  const mediaTags = inferMediaFromContext(projectTopic, file.name);
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  const topicClean = projectTopic.trim() || '디자인 무드보드';

  const title = baseName && !/^(img|image|photo|screenshot|pasted)/i.test(baseName)
    ? `${baseName} 레퍼런스`
    : `${topicClean} 시안`;

  const description = `${colorTags.join('·')} 색감과 ${compTags.join('·')} 구성을 바탕으로 ${topicClean} 맥락에 어울리는 ${moodTags[0].replace('#', '')} 톤의 ${mediaTags[0].replace('#', '')} 레퍼런스`;

  return {
    title,
    description,
    tags: {
      색감: colorTags,
      구성: compTags,
      분위기: moodTags,
      매체: mediaTags,
    },
    source: '스마트 로컬 자동 분석 (색감·구도·주제 컨텍스트)',
  };
}

async function analyzeImageWithGemini(apiKey, dataUrl, projectTopic) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) throw new Error('이미지 데이터 인코딩 형식이 올바르지 않습니다.');
  const mimeType = match[1];
  const base64Data = match[2];

  const promptText = `${MOABOM_AI_PROMPT}

프로젝트 주제 컨텍스트: "${projectTopic || '일반 디자인 레퍼런스'}"

반드시 아래 JSON 스키마로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "title": "15자 이내 한국어 레퍼런스 제목",
  "description": "검색에 최적화된 한국어 한 줄 설명 (50~85자 내외)",
  "tags": {
    "색감": ["#태그1", "#태그2"],
    "구성": ["#태그1", "#태그2"],
    "분위기": ["#태그1", "#태그2"],
    "매체": ["#태그1"]
  }
}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${errBody.slice(0, 140)}`);
  }

  const json = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Gemini API 응답에서 분석 결과를 찾지 못했습니다.');

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  const normalizeTagArr = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((t) => String(t).trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .slice(0, 4);

  return {
    title: String(parsed.title || `${projectTopic || '디자인'} 레퍼런스`).trim(),
    description: String(parsed.description || '멀티모달 AI가 분석한 디자인 레퍼런스').trim(),
    tags: {
      색감: normalizeTagArr(parsed.tags?.색감),
      구성: normalizeTagArr(parsed.tags?.구성),
      분위기: normalizeTagArr(parsed.tags?.분위기),
      매체: normalizeTagArr(parsed.tags?.매체),
    },
    source: 'Gemini 2.5 Flash 멀티모달 AI',
  };
}
