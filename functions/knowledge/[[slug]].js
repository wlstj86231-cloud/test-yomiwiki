const pages = {
  'potato-special-grade': {
    title:'감자 특품 기준, 거래 전에 무엇을 확인할까', category:'품목 · 등급·선별',
    description:'감자 특·상·보통 등급을 볼 때 크기만 보지 않고 고르기, 형태, 결점, 품종과 출하 규격을 함께 확인하는 현장 점검 순서입니다.',
    lead:'농산물 표준규격의 등급은 고르기·형태·크기·결점 등 여러 항목을 함께 봅니다. “특품”이라는 말만 믿기보다 출하처 규격표와 실제 샘플을 같이 확인하는 것이 안전합니다.',
    sections:[
      ['등급표부터 확인',['국립농산물품질관리원의 감자 등급규격에서 특·상·보통 구분 항목을 확인합니다.','같은 감자라도 품종, 거래처, 포장 단량에 따라 요구 크기가 달라질 수 있습니다.','판매자가 쓰는 “왕특”, “특대” 같은 표현은 국가 등급명과 다를 수 있어 실제 지름·중량 범위를 묻습니다.']],
      ['외관과 결점을 함께 보기',['모양과 크기가 고른지, 기형·열개·상처·병해충 흔적이 있는지 확인합니다.','녹변, 부패, 싹 발생, 동해 흔적은 식용성과 저장성에 영향을 줄 수 있습니다.','상자 윗부분만 보지 말고 가능하면 여러 위치의 샘플을 확인합니다.']],
      ['표시와 거래 조건 기록',['표준규격품은 품목·산지·품종·등급·무게 또는 개수·생산자 정보를 확인합니다.','수확일, 선별일, 보관 방식, 흙 제거 여부, 파손·부패 처리 기준을 계약 전에 기록합니다.']]
    ],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['감자 등급규격','https://www.naqs.go.kr/hp/contents/contentsTab.do?bbsSn=0&gnrlzGroupLevelStvl=03040040020000&hghrkMenuId=MN10003&menuId=MN40332&menuNm=%EB%86%8D%EC%82%B0%EB%AC%BC+%EB%93%B1%EA%B8%89%EA%B7%9C%EA%B2%A9&menuTypeStvl=CON&tmptNm=tabContents&upMenuId=MN30614&upMenuTypeCd=TAB']],
    related:[['농산물 등급표 읽는 법','produce-grading'],['농산물 보관·출하 기본','storage-shipping'],['거래 용어 빠른 사전','trade-terms']],
    boribay:'https://boribay.com/guides/new-potato-10kg-price-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=potato_special_grade', boribayText:'감자 시세와 직거래 준비 보기'
  },
  'produce-grading': {
    title:'농산물 등급표 읽는 법: 특·상·보통의 의미', category:'등급·선별',
    description:'농산물 표준규격의 특·상·보통 등급과 고르기, 형태, 크기, 결점 항목을 거래 전에 확인하는 방법입니다.',
    lead:'농산물 등급은 가격표가 아니라 품질을 객관적으로 설명하기 위한 거래 언어입니다. 품목별 규격이 다르므로 등급명 하나보다 어떤 항목으로 판정했는지 확인해야 합니다.',
    sections:[['등급을 구성하는 항목',['고르기, 형태, 크기, 결점 등 품질 구분에 필요한 항목을 품목별로 봅니다.','등급규격과 포장규격은 목적이 다릅니다. 등급은 품질, 포장은 단량·치수·재료·표시를 다룹니다.']],['표시사항 확인',['표준규격품 문구와 함께 품목·산지·품종·등급·무게 또는 개수·생산자 정보를 확인합니다.','온라인 거래 사진에도 표시사항과 실제 샘플이 일치하는지 확인합니다.']],['현장 거래에 적용',['판매자와 구매자가 같은 규격표를 놓고 크기·결점 허용 범위를 확인합니다.','선별 기준, 검수 표본 수, 반품·감액 조건을 문자나 계약서로 남깁니다.']]],
    sources:[['국립농산물품질관리원 표준규격','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['농산물 등급규격 품목 목록','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN40332']],
    related:[['감자 특품 기준','potato-special-grade'],['농산물 품목별 확인','produce-items'],['거래 용어 빠른 사전','trade-terms']], boribay:'https://boribay.com/guides?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_grading',boribayText:'품목별 직거래 확인표 보기'
  },
  'storage-shipping': {
    title:'농산물 보관·출하 기본: 온도 숫자보다 먼저 볼 것', category:'보관·출하',
    description:'농산물 저장 온도만 검색하기 전에 품온, 예건, 통풍, 습도, 결로, 선별 상태를 함께 확인하는 기본 절차입니다.',
    lead:'같은 품목도 품종·수확 성숙도·저장 기간·포장 방식에 따라 조건이 달라집니다. 인터넷의 단일 온도 숫자를 그대로 적용하지 말고 품목별 공식 지침과 저장고 상태를 같이 봅니다.',
    sections:[['입고 전 선별',['상처·병해·과숙·젖은 농산물을 분리해 저장 중 확산을 줄입니다.','수확 직후 품온과 표면 수분을 확인하고 필요한 예건·큐어링 절차를 거칩니다.']],['저장고 확인',['온도계와 습도계 위치를 여러 곳에 두고 편차를 확인합니다.','벽·바닥과 적재물 사이 통풍 길을 확보하고 결로·성에·배수 상태를 봅니다.']],['출하 전 기록',['입고일·수확일·저장 조건·선별 손실·출하 수량을 기록합니다.','포장 후에도 통풍과 압상 위험을 확인하고 운송 중 온도 변화 책임을 정합니다.']]],
    sources:[['농촌진흥청 농사로','https://www.nongsaro.go.kr/'],['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614']], related:[['농산물 등급표 읽는 법','produce-grading'],['벼 건조 전 확인','rice-drying'],['농산물 품목별 확인','produce-items']], boribay:'https://boribay.com/guides?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=storage_shipping',boribayText:'제철 농산물 거래 준비 보기'
  },
  'tractor-hours': {
    title:'중고 트랙터 사용시간, 계기판 숫자만 믿으면 안 되는 이유', category:'농기계',
    description:'중고 트랙터 시간계와 함께 정비 이력, 작업 종류, 누유, PTO, 유압, 변속, 타이어와 제조번호를 점검하는 순서입니다.',
    lead:'사용시간은 중요한 단서지만 장비 상태 전체를 대신하지 않습니다. 계기판 교체·고장 가능성과 작업 부하 차이가 있어 정비 기록과 실물 마모를 함께 확인해야 합니다.',
    sections:[['시간계의 맥락 확인',['연식·구입 시점·소유자 수·연간 사용시간을 비교합니다.','계기판 교체나 수리 여부와 이전 정비 영수증의 시간 기록을 확인합니다.']],['냉간 시동과 작동 점검',['판매자가 미리 예열하지 않은 상태에서 시동성·이상음·매연을 확인합니다.','엔진·미션·유압 누유, PTO, 상승·하강, 변속, 조향, 브레이크를 순서대로 작동합니다.']],['계약서에 식별정보 기록',['명판의 모델명·제조번호와 서류가 일치하는지 확인합니다.','포함되는 로터리·로더·쟁기 등 부속기와 알려진 하자를 계약서에 적습니다.']]],
    sources:[['농촌진흥청 농사로 농업기계','https://www.nongsaro.go.kr/'],['농업기계 안전정보시스템','https://amis.rda.go.kr/']], related:[['농기계 거래 기본','farm-machinery'],['거래 용어 빠른 사전','trade-terms'],['농산물 품목별 확인','produce-items']], boribay:'https://boribay.com/guides/used-tractor-buying-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=tractor_hours',boribayText:'중고 트랙터 매물 점검표 보기'
  },
  'farm-machinery': {
    title:'농기계 거래 기본: 명판·시운전·부속기 확인 순서', category:'농기계',
    description:'트랙터와 관리기 등 중고 농기계 거래에서 모델명, 제조번호, 정비 이력, 시운전, 부속기와 하자 고지를 확인하는 체크리스트입니다.',
    lead:'농기계 매물은 같은 모델명이라도 연식·사양·부속기·작업 이력에 따라 상태와 가격이 크게 달라집니다. 사진보다 명판과 실제 작동 확인을 우선합니다.',
    sections:[['기계 신원 확인',['명판의 제조사·모델명·제조번호를 촬영하고 판매자 설명과 비교합니다.','도난·압류·할부 잔액 등 권리관계가 의심되면 거래를 멈추고 관련 서류를 확인합니다.']],['시운전 순서',['냉간 시동부터 예열, 주행, 변속, 제동, PTO, 유압, 누유 순서로 봅니다.','가능하면 실제 부하를 걸어 작동하고 정비 전문가와 동행합니다.']],['부속기와 운송',['로터리·로더·쟁기 규격과 연결부 마모, 안전커버를 확인합니다.','상차·운송·하차 비용과 파손 책임, 인도 장소를 계약 전에 정합니다.']]],
    sources:[['농업기계 안전정보시스템','https://amis.rda.go.kr/'],['농촌진흥청 농사로','https://www.nongsaro.go.kr/']],related:[['중고 트랙터 사용시간','tractor-hours'],['거래 용어 빠른 사전','trade-terms'],['농산물 품목별 확인','produce-items']],boribay:'https://boribay.com/guides/used-tractor-price-comparison-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=farm_machinery',boribayText:'중고 농기계 가격 비교 준비 보기'
  },
  'trade-terms': {
    title:'농산물·농기계 거래 용어 빠른 사전', category:'거래용어',
    description:'직거래에서 자주 쓰는 특품, 실중량, 상차도, 도착도, 선별비, 수수료, 예약금, 하자 고지의 뜻과 확인 질문입니다.',
    lead:'거래 분쟁은 같은 단어를 서로 다르게 이해할 때 자주 생깁니다. 가격을 합의하기 전에 중량 기준, 비용 포함 범위, 인도 시점과 하자 책임을 문장으로 풀어 확인합니다.',
    sections:[['중량·품질 용어',['실중량은 포장재를 제외한 내용물 중량인지 확인합니다.','특·상·보통은 품목별 규격 또는 당사자 합의 기준을 명시합니다.']],['가격·인도 용어',['상차도·도착도 등 인도 조건에 운임·상하차 비용이 어디까지 포함되는지 확인합니다.','선별비·포장비·수수료·부가세 포함 여부를 총액과 단가로 나눠 적습니다.']],['계약·책임 용어',['예약금·계약금·잔금의 지급 시점과 취소 조건을 적습니다.','농기계 하자 고지는 알려진 결함과 수리 필요 사항을 구체적으로 기록합니다.']]],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['농산물 원산지 표시','https://www.naqs.go.kr/hp/contents/contents.do?menuId=MN30559']],related:[['농산물 등급표 읽는 법','produce-grading'],['농기계 거래 기본','farm-machinery'],['농산물 품목별 확인','produce-items']],boribay:'https://boribay.com/guides?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=trade_terms',boribayText:'직거래 준비 가이드 보기'
  },
  'produce-items': {
    title:'농산물 품목별 거래 확인 순서', category:'품목',
    description:'감자, 양파, 쌀, 사과, 복숭아 등 농산물 직거래에서 품종·산지·수확일·등급·실중량·보관·배송을 확인하는 공통 순서입니다.',
    lead:'품목마다 세부 기준은 다르지만 거래 전에 확인할 뼈대는 같습니다. 품종과 산지에서 시작해 수확·선별·중량·보관·배송·분쟁 기준까지 순서대로 묻습니다.',
    sections:[['품목과 생산 정보',['정확한 품목·품종·생산지와 생산자·판매자 관계를 확인합니다.','수확일, 재배 방식, 선별일과 현재 보관 상태를 묻습니다.']],['상품과 가격 정보',['등급·크기·개수·실중량을 같은 단위로 비교합니다.','배송비·포장비·수수료를 포함한 kg당 또는 개당 가격을 계산합니다.']],['인도와 문제 처리',['발송 예정일, 운송 방식, 신선도 유지 포장과 수령 직후 확인 방법을 정합니다.','파손·부패·중량 부족 시 사진 기준과 환불·재배송 조건을 합의합니다.']]],
    sources:[['국립농산물품질관리원','https://www.naqs.go.kr/'],['KAMIS 농산물유통정보','https://www.kamis.or.kr/']],related:[['감자 특품 기준','potato-special-grade'],['농산물 등급표 읽는 법','produce-grading'],['농산물 보관·출하 기본','storage-shipping']],boribay:'https://boribay.com/guides?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_items',boribayText:'제철 품목별 직거래 가이드 보기'
  },
  'cattle-traceability': {
    title:'한우 거래 전 이력번호와 개체정보 확인', category:'농축산물',
    description:'한우 거래에서 귀표의 개체식별번호와 축산물이력제 개체정보, 농장, 이동, 질병 검사 정보를 확인하는 기본 절차입니다.',
    lead:'체중과 외관만으로 거래하지 말고 귀표와 이력정보가 실제 개체와 일치하는지 먼저 확인합니다. 출하 판단과 가격 협상은 월령·건강·사양·정산 기준을 함께 봅니다.',
    sections:[['개체식별번호 확인',['귀표의 개체식별번호를 읽고 축산물이력제 조회 정보와 대조합니다.','귀표 훼손·재부착 흔적이나 판매자 설명과 다른 정보가 있으면 거래를 보류합니다.']],['개체정보와 기록',['출생·농장·이동·질병 검사 등 조회 가능한 정보를 확인합니다.','예방접종·치료·사양 기록과 최근 계근 결과를 판매자에게 요청합니다.']],['인도·정산 기준',['계근 장소와 시간, 운송비, 감량·수수료, 인도 시점을 계약서에 적습니다.','출하나 사육 판단은 지역 축협·수의사·전문가 자료와 함께 결정합니다.']]],
    sources:[['축산물이력제','https://www.mtrace.go.kr/main.do'],['축산물이력제 데이터랩','https://datalab.mtrace.go.kr/']],related:[['농산물 품목별 확인','produce-items'],['거래 용어 빠른 사전','trade-terms'],['농기계 거래 기본','farm-machinery']],boribay:'https://boribay.com/?query=%ED%95%9C%EC%9A%B0&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=cattle_traceability',boribayText:'한우 지역 거래 준비 보기'
  },
  'rice-drying': {
    title:'벼 건조 전 확인: 수분 측정부터 저장까지', category:'보관·출하',description:'벼 수확 후 수분을 여러 지점에서 측정하고 건조기 방식과 용도에 맞춰 온도·시간·냉각·저장을 관리하는 확인 순서입니다.',lead:'벼 건조는 단일 온도 숫자보다 초기 수분, 품종, 용도, 건조기 방식과 처리량을 함께 봐야 합니다. 고온 급건조는 품질 저하 위험이 있어 장비 설명서와 공식 재배 지침을 우선합니다.',sections:[['수분 측정',['여러 지점에서 대표 시료를 채취해 초기 수분과 품온을 기록합니다.','수분계 교정 상태와 측정 오차를 확인합니다.']],['건조기 설정',['식용·종자용 등 용도와 건조기 방식에 맞는 설정을 사용합니다.','과다 투입을 피하고 순환·배출 상태와 이상 소음을 점검합니다.']],['냉각·저장',['건조 후 곡온을 충분히 낮추고 결로가 생기지 않게 저장합니다.','품종·수확일·건조 시작·종료·최종 수분을 출하 기록에 남깁니다.']]],sources:[['농촌진흥청 농사로','https://www.nongsaro.go.kr/'],['국립농산물품질관리원 양곡 표시','https://www.naqs.go.kr/hp/contents/contents.do?menuId=MN30613']],related:[['농산물 보관·출하 기본','storage-shipping'],['농산물 품목별 확인','produce-items'],['거래 용어 빠른 사전','trade-terms']],boribay:'https://boribay.com/guides/fresh-milled-rice-buying-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=rice_drying',boribayText:'햅쌀 직거래 확인 기준 보기'
  },
  'fertilizer-use': {
    title:'비료 사용 전 확인: 토양검정·성분량·살포 기록', category:'농자재',description:'비료를 사용하기 전에 작물과 생육 단계, 토양검정, 제품 성분과 표시사항, 살포 조건, 사용 기록을 확인하는 기본 순서입니다.',lead:'비료는 제품 이름보다 성분량과 작물·토양 상태를 기준으로 판단합니다. 포장 표시와 지역 농업기술센터 처방을 우선하고, 관행량을 그대로 반복하지 않습니다.',sections:[['토양과 작물 확인',['토양검정 결과와 작물의 생육 단계·재배 목표를 확인합니다.','질소·인산·칼리와 미량요소의 현재 상태를 봅니다.']],['제품 표시 읽기',['보증 성분량, 대상 작물, 사용량, 사용 시기, 주의사항을 확인합니다.','같은 상표라도 성분비가 다를 수 있어 포대 표시를 사진으로 남깁니다.']],['살포와 기록',['강풍·폭우 전 살포를 피하고 보호장비와 살포기 설명을 지킵니다.','제품명·사용량·사용일·포장을 기록하고 남은 제품은 건조하게 보관합니다.']]],sources:[['농촌진흥청 농사로','https://www.nongsaro.go.kr/'],['흙토람 토양환경정보시스템','https://soil.rda.go.kr/']],related:[['농산물 품목별 확인','produce-items'],['농산물 보관·출하 기본','storage-shipping'],['농기계 거래 기본','farm-machinery']],boribay:'https://boribay.com/?query=%EB%B9%84%EB%A3%8C&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=fertilizer_use',boribayText:'농자재 지역 거래 준비 보기'
  }
};

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon=name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;

export async function onRequestGet({request,params}){
  const slug=String(params.slug||'').replace(/^\/+|\/+$/g,'');
  const page=pages[slug];
  if(!page)return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><title>문서를 찾을 수 없습니다 | 요미위키</title><body><main><h1>문서를 찾을 수 없습니다.</h1><p><a href="/">요미위키 검색으로 돌아가기</a></p></main></body></html>',{status:404,headers:{'Content-Type':'text/html;charset=UTF-8','X-Robots-Tag':'noindex,follow'}});
  const canonical=`https://yomiwiki.com/knowledge/${slug}`;
  const sectionHtml=page.sections.map((section,index)=>`<section class="content-section"><h2><span>${index+1}</span>${escapeHtml(section[0])}</h2><ul class="check-list">${section[1].map(item=>`<li>${icon('circle-check-big')}<span>${escapeHtml(item)}</span></li>`).join('')}</ul></section>`).join('');
  const relatedHtml=page.related.map(([label,path])=>`<a href="/knowledge/${path}">${escapeHtml(label)}</a>`).join('');
  const sourcesHtml=page.sources.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ${icon('external-link')}</a>`).join('');
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:page.title,description:page.description,datePublished:'2026-08-09',dateModified:'2026-08-09',inLanguage:'ko-KR',mainEntityOfPage:canonical,author:{'@type':'Organization',name:'요미위키 편집팀'},publisher:{'@type':'Organization',name:'요미위키',url:'https://yomiwiki.com/'}}).replace(/</g,'\\u003c');
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(page.title)} | 요미위키</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(page.title)} | 요미위키"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="/knowledge.css?v=3.0.0"><script type="application/ld+json">${schema}</script></head><body><header class="site-header"><div class="header-inner"><a class="brand" href="/"><span class="brand-mark">${icon('sprout')}</span><strong>요미위키</strong></a><nav class="top-nav"><a href="/knowledge/produce-items">${icon('wheat')}품목</a><a href="/knowledge/produce-grading">${icon('notebook-tabs')}등급·선별</a><a href="/knowledge/storage-shipping">${icon('warehouse')}보관·출하</a><a href="/knowledge/farm-machinery">${icon('tractor')}농기계</a><a href="/knowledge/trade-terms">${icon('book-open')}거래용어</a></nav></div></header><main><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a>${icon('chevron-right')}<span>${escapeHtml(page.category)}</span></nav><article><header class="article-head"><p class="article-kicker">${icon('book-check')}${escapeHtml(page.category)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><div class="article-meta"><span>${icon('calendar-days')}기준일 2026-08-09</span><span>${icon('refresh-cw')}공식 자료 확인</span><span>${icon('shield-check')}광고와 편집 분리</span></div></header><div class="article-grid"><div><section class="lead-box"><strong>먼저 알아두세요</strong><p>${escapeHtml(page.lead)}</p></section>${sectionHtml}<section class="source-box"><h2>확인한 공식 자료</h2>${sourcesHtml}<p>공식 기준은 개정될 수 있습니다. 실제 거래·사용 전 최신 원문과 지역 담당기관 안내를 다시 확인하세요.</p></section></div><aside class="rail"><section><h2>관련 문서</h2><nav>${relatedHtml}</nav></section><section class="boribay-box"><h2>거래 준비로 이어가기</h2><p>기준을 확인했다면 현재 시세와 지역 매물을 보리장터에서 비교하세요.</p><a href="${escapeHtml(page.boribay)}">${escapeHtml(page.boribayText)} ${icon('arrow-right')}</a><span class="notice">보리장터 이동 링크에는 유입 경로 측정값이 포함됩니다.</span></section></aside></div></article></main><footer class="site-footer"><div><span>© 2026 요미위키 · 농산물·농기계 거래 지식사전</span><nav><a href="/about">소개</a><a href="/editorial-policy">편집 원칙</a><a href="/privacy">개인정보</a><a href="/contact">문의</a></nav></div></footer><script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script><script>if(window.lucide)lucide.createIcons();document.querySelectorAll('a[href*="boribay.com"]').forEach(a=>a.addEventListener('click',()=>window.gtag&&gtag('event','owned_referral_click',{source_domain:'yomiwiki.com',destination:a.href})));</script></body></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8','Cache-Control':'public,max-age=0,must-revalidate'}});
}
