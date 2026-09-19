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
    related:[['감자 특품 기준','potato-special-grade'],['농산물 품목별 확인','produce-items'],['거래 용어 빠른 사전','trade-terms']], boribay:'https://boribay.com/guides/agricultural-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_grading',boribayText:'농산물 시세 확인 순서 보기'
  },
  'storage-shipping': {
    title:'농산물 보관·출하 기본: 온도 숫자보다 먼저 볼 것', category:'보관·출하',
    description:'농산물 저장 온도만 검색하기 전에 품온, 예건, 통풍, 습도, 결로, 선별 상태를 함께 확인하는 기본 절차입니다.',
    lead:'같은 품목도 품종·수확 성숙도·저장 기간·포장 방식에 따라 조건이 달라집니다. 인터넷의 단일 온도 숫자를 그대로 적용하지 말고 품목별 공식 지침과 저장고 상태를 같이 봅니다.',
    sections:[['입고 전 선별',['상처·병해·과숙·젖은 농산물을 분리해 저장 중 확산을 줄입니다.','수확 직후 품온과 표면 수분을 확인하고 필요한 예건·큐어링 절차를 거칩니다.']],['저장고 확인',['온도계와 습도계 위치를 여러 곳에 두고 편차를 확인합니다.','벽·바닥과 적재물 사이 통풍 길을 확보하고 결로·성에·배수 상태를 봅니다.']],['출하 전 기록',['입고일·수확일·저장 조건·선별 손실·출하 수량을 기록합니다.','포장 후에도 통풍과 압상 위험을 확인하고 운송 중 온도 변화 책임을 정합니다.']]],
    sources:[['농촌진흥청 농사로','https://www.nongsaro.go.kr/'],['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614']], related:[['농산물 등급표 읽는 법','produce-grading'],['벼 건조 전 확인','rice-drying'],['농산물 품목별 확인','produce-items']], boribay:'https://boribay.com/guides/produce-direct-shipping-buying-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=storage_shipping',boribayText:'산지직송 구매 확인 순서 보기'
  },
  'tractor-hours': {
    title:'중고 트랙터 사용시간, 계기판 숫자만 믿으면 안 되는 이유', category:'농기계',
    description:'중고 트랙터 시간계와 함께 정비 이력, 작업 종류, 누유, PTO, 유압, 변속, 타이어와 제조번호를 점검하는 순서입니다.',
    lead:'사용시간은 중요한 단서지만 장비 상태 전체를 대신하지 않습니다. 계기판 교체·고장 가능성과 작업 부하 차이가 있어 정비 기록과 실물 마모를 함께 확인해야 합니다.',
    sections:[['시간계의 맥락 확인',['연식·구입 시점·소유자 수·연간 사용시간을 비교합니다.','계기판 교체나 수리 여부와 이전 정비 영수증의 시간 기록을 확인합니다.']],['냉간 시동과 작동 점검',['판매자가 미리 예열하지 않은 상태에서 시동성·이상음·매연을 확인합니다.','엔진·미션·유압 누유, PTO, 상승·하강, 변속, 조향, 브레이크를 순서대로 작동합니다.']],['계약서에 식별정보 기록',['명판의 모델명·제조번호와 서류가 일치하는지 확인합니다.','포함되는 로터리·로더·쟁기 등 부속기와 알려진 하자를 계약서에 적습니다.']]],
    sources:[['농촌진흥청 농사로 농업기계','https://www.nongsaro.go.kr/'],['농업기계 안전정보시스템','https://amis.rda.go.kr/']], related:[['농기계 거래 기본','farm-machinery'],['거래 용어 빠른 사전','trade-terms'],['농산물 품목별 확인','produce-items']], boribay:'https://boribay.com/guides/used-tractor-buying-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=tractor_hours',boribayText:'중고 트랙터 매물 점검표 보기'
  },
  'farm-machinery': {
    title:'농기계 거래 기본: 명판·작업기·상하차 용어와 확인 기준', category:'농기계', modified:'2026-09-16',
    description:'중고 농기계 판매와 운송 견적에서 사용하는 모델명, 사용시간, 작업기 포함, 자력 상차, 운송비와 하자 고지의 뜻을 구분합니다.',
    lead:'농기계 매물은 같은 모델명이라도 연식·사양·부속기·작업 이력에 따라 상태와 가격이 크게 달라집니다. 사진보다 명판과 실제 작동 확인을 우선합니다.',
    sections:[
      ['명판·연식·사용시간은 서로 다른 정보',['모델명은 기계 형식을, 제조번호는 개별 기계를 구분하는 정보입니다. 명판의 제조사·모델명·제조번호를 판매자가 보유한 서류와 대조합니다.','제조연도와 구입연도가 같다고 가정하지 않습니다. 연식의 근거가 명판인지 구입 서류인지 표시하고 확인할 수 없으면 미확인으로 적습니다.','시간계는 누적 작동의 단서입니다. 교체·고장 이력과 이전 정비 기록을 함께 확인하며 숫자 하나를 잔여 수명으로 해석하지 않습니다.']],
      ['PTO·유압·작업기 포함의 뜻',['PTO는 작업기에 회전 동력을 전달하는 장치입니다. 유압은 작업기를 올리고 내리는 등의 기능과 관련되므로 둘을 같은 점검으로 처리하지 않습니다.','작업기는 로터리·쟁기처럼 본체에 연결해 사용하는 장비입니다. “작업기 포함”이면 명칭·모델·수량·연결 규격을 각각 적습니다.','시운전은 시동이 걸린다는 설명보다 넓은 확인입니다. 냉간 시동, 변속, 제동과 필요한 작업기 작동 범위를 판매자와 정하고 안전한 장소에서 숙련자와 확인합니다.']],
      ['자력 상차·운송·하차를 구분하기',['상차는 출발지에서 운송 차량에 싣는 작업, 운송은 장소 사이 이동, 하차는 도착지에서 내리는 작업입니다. 운송비에 세 작업이 모두 포함되는지는 별도로 확인합니다.','자력 상차 가능이라는 설명에는 기계가 스스로 움직일 수 있는지가 포함됩니다. 실제 상차 가능 여부는 제동·조향 상태, 운송 차량과 현장 조건까지 운송 담당자가 확인해야 합니다.','본체 제원과 작업기를 붙인 전체 크기·중량은 다를 수 있습니다. 견적에는 어떤 상태의 길이·너비·높이·중량인지 함께 표시합니다.','“운송비 별도”는 금액이 확정됐다는 뜻이 아닙니다. 상하차 장비비·대기료·통행료와 손상 보상 범위를 항목별로 확인합니다.'],['이 용어로 농기계 탁송 견적 요청 항목 확인하기','https://boribay.com/guides/farm-machinery-transport-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=machinery_transport_terms']],
      ['판매 설명의 하자·수리 이력·미확인 구분',['하자는 현재 알고 있는 결함, 수리 이력은 과거에 한 작업입니다. “수리 완료”라고 적을 때는 수리 날짜·부분과 이후 확인한 상태를 구분합니다.','예: “유압 호스 교체 영수증 있음, 교체 후 공회전 확인, 작업 부하 상태는 미확인”처럼 관찰한 사실을 적습니다. 이 예시는 특정 매물의 상태나 보증이 아닙니다.','판매 글에 공개할 정보와 실물 대조용 원본을 구분합니다. 전체 식별번호·연락처 등 불필요한 개인정보가 사진에 노출되지 않는지 확인합니다.'],['용어를 정리한 뒤 중고 농기계 판매 글 준비하기','https://boribay.com/guides/used-machinery-selling-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=machinery_sale_terms']]
    ],
    faq:[['마력이 같으면 운송 견적도 같나요?','마력은 출력 정보입니다. 같은 마력이라도 차체와 작업기 크기·중량, 출발지·도착지의 상하차 조건이 다를 수 있어 같은 견적으로 단정할 수 없습니다.'],['작업기 포함이면 바로 사용할 수 있나요?','포함 여부는 판매 범위에 대한 설명입니다. 연결 규격·상태·누락 부품·안전커버와 실제 작동 여부는 따로 확인합니다.']],
    sources:[['농촌진흥청 작업기 탈부착과 PTO·유압 연결','https://www.rda.go.kr/board/board.do?boardId=farmprmninfo&dataNo=100000758789&mode=updateCnt&prgId=day_farmprmninfoEntry'],['농촌진흥청 농기계 자가 점검·안전관리','https://www.rda.go.kr/board/board.do?dataNo=100000809513&mode=view&prgId=day_farmprmninfoEntry']],related:[['중고 트랙터 사용시간','tractor-hours'],['거래 용어 빠른 사전','trade-terms'],['농산물 품목별 확인','produce-items']],boribay:'https://boribay.com/guides/used-tractor-price-comparison-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=farm_machinery',boribayText:'중고 농기계 가격 비교 준비 보기'
  },
  'trade-terms': {
    title:'농산물·농기계 거래 용어: 경락가·단량·실중량 읽는 법', category:'거래용어', modified:'2026-09-19',
    description:'가락시장 시세표의 경락가·등급·단량과 직거래의 실중량·kg당 가격·배송비·정산액을 구분하는 거래 용어 사전입니다.',
    lead:'거래 분쟁은 같은 단어를 서로 다르게 이해할 때 자주 생깁니다. 가격을 합의하기 전에 중량 기준, 비용 포함 범위, 인도 시점과 하자 책임을 문장으로 풀어 확인합니다.',
    sections:[
      ['경락가·평균가격·직거래 판매가',['경락가는 경매에서 거래가 성립한 가격입니다. 시세표의 평균가격은 조회 조건에 속한 거래를 집계한 값이므로 모든 물량이 그 금액에 거래됐다는 뜻은 아닙니다.','서울가락 오늘 숫자는 거래량 가중 kg당과 최저~최고 범위로 읽습니다. 최고가 한 건을 대표 시세로 쓰지 않습니다.','직거래 판매가는 판매자가 제시한 조건의 가격입니다. 도매시장 참고가격과 실제 소비자 결제액을 구분하고 배송·선별·포장 조건을 덧붙입니다.'],['오늘 서울가락 kg당 가중평균 표 열기','https://boribay.com/guides/garak-market-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=auction_price_terms']],
      ['단량·실중량·등급',['단량은 한 거래 단위에 들어 있는 양입니다. “10kg 상자”의 10kg과 주문한 상자 수를 구분합니다. 개수 단위 상품을 무게 상품과 비교하려면 실제 중량 정보가 필요합니다.','실중량은 거래에서 어떤 무게를 뜻하는지 확인합니다. 가격 비교에는 포장재를 제외한 농산물 내용량을 사용하고, 상자 전체를 잰 총중량과 섞지 않습니다.','특·상·보통은 품목별 규격 또는 당사자가 밝힌 선별 기준을 확인해야 합니다. 단위만 같아도 품종·등급·수확 시기가 다르면 같은 상품 비교가 아닙니다.']],
      ['kg당 가격·결제액·정산액',['상품의 kg당 가격은 상품금액을 내용량으로 나눈 값입니다. 배송 포함 가격을 말할 때는 배송비가 상자별인지 주문 전체인지 먼저 적습니다.','계산 연습용 예: 내용량 8kg 상품 24,000원과 주문 전체 배송비 4,000원이면 구매 결제액은 28,000원, 배송 포함 kg당 가격은 3,500원입니다. 실제 시세 예시가 아닙니다.','구매자 결제액과 판매자 정산액은 다릅니다. 정산액은 판매 조건에 따른 수수료·배송 부담·할인 등의 공제 내역까지 확인해야 하며, 단가만으로 순이익을 알 수 없습니다.'],['상품금액·내용량·배송비를 나눠 가격 계산하기','https://boribay.com/guides/produce-price-calculator?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=net_weight_terms']],
      ['상차도·도착도·하자 고지',['상차도·도착도라는 말만으로 운임·상하차 비용과 인도 책임이 모두 정해졌다고 보지 않습니다. 누가 어느 장소까지 무엇을 부담하는지 문장으로 합의합니다.','예약금·계약금·잔금의 지급 시점과 취소 조건을 적습니다. 농기계 하자 고지는 알려진 결함과 수리 필요 사항을 구체적으로 기록합니다.']]
    ],
    faq:[['가락시장 오늘 시세는 어디서 보나요?','서울가락 잠정·확정 경락가를 거래량 가중 kg당으로 보려면 보리장터 서울가락 표를 엽니다. 최고가 한 건을 시세로 쓰지 말고, 원자료는 공식 가격정보에서도 확인합니다.'],['10kg 상자가 5kg 상자보다 항상 저렴한가요?','상자 가격만으로 판단할 수 없습니다. 같은 품질 조건에서 내용량과 실제 적용 배송비를 확인해 kg당 가격을 비교합니다.']],
    sources:[['서울특별시농수산식품공사 주요 품목 가격 항목','https://www.data.go.kr/data/15004517/openapi.do'],['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614']],    related:[['농산물 등급표 읽는 법','produce-grading'],['포장 단위 그물망·단·상자','pack-unit-terms'],['농산물 품목별 확인','produce-items']],boribay:'https://boribay.com/guides/garak-market-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=trade_terms',boribayText:'서울가락 오늘 경락가 kg당 표 보기'
  },
  'pack-unit-terms': {
    title:'농산물 포장 단위: 그물망·단·20kg 상자를 kg으로 읽는 법', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'배추 10kg 그물망, 대파 단·망, 양파 15kg 망, 김장무 20kg 상자, 홍로 10kg 상자를 실중량 kg당으로 맞춰 시세와 비교하는 거래 용어입니다.',
    lead:'포장 단위 이름과 kg당은 다른 정보입니다. 망·단·상자 가격을 시세처럼 쓰기 전에 포장재를 뺀 내용 중량으로 나누고, 품목명이 같은지 확인합니다.',
    sections:[
      ['배추 10kg 그물망',['그물망 표시 10kg는 한 거래 단위의 이름입니다. 가격 비교에는 배추만의 실중량을 사용하고 포장재 무게를 넣지 않습니다.','김장 포기 수·결구 크기·겉잎 제거 여부가 다르면 같은 10kg 망으로 묶지 않습니다. 가락 표는 kg당이므로 망 가격을 나눈 뒤에 대조합니다.'],['서울가락 배추 10kg 그물망 kg당 보기','https://boribay.com/guides/garak-cabbage-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=baechu_net_kg']],
      ['대파 단·망과 쪽파',['대파 한 단의 무게는 묶음마다 다를 수 있습니다. 단 수만 보고 kg당 시세와 같다고 보지 않습니다.','쪽파는 파종 작형이고 대파는 출하·도매 품목입니다. 이름만 비슷한 작물을 한 가격으로 읽지 않습니다.'],['서울가락 대파 kg·망 단위 보기','https://boribay.com/guides/garak-daepa-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=daepa_bundle_kg']],
      ['양파 15kg 망·김장무 20kg·홍로 10kg',['양파 15kg 그물망은 저장양파와 햇양파·품종을 같은 행으로 묶지 않습니다. 부패·발근 구를 뺀 판매 가능 중량으로 다시 나누면 kg당이 달라집니다.','김장무 20kg 상자는 심는 시기 안내와 다른 정보입니다. 상자 표시가 무 실중량인지 총중량인지 확인합니다.','홍로 10kg 상자는 품종명 홍로와 햇사과 판매 문구, 개수·실중량을 나눠 본 뒤 kg당으로 비교합니다.'],['서울가락 양파 15kg 망 kg당 보기','https://boribay.com/guides/garak-onion-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=onion_mesh_kg']]
    ],
    faq:[['10kg 망이면 무조건 kg당으로 나누면 되나요?','표시 중량이 내용물 실중량인지 먼저 확인합니다. 포장재 포함 총중량으로 나누면 kg당이 낮아져 시세와 어긋납니다.'],['단 가격을 망 가격과 바로 비교해도 되나요?','단과 망의 실제 내용 kg이 다를 수 있습니다. 둘 다 kg당으로 맞춘 뒤에만 비교합니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['서울특별시농수산식품공사 주요 품목 가격 항목','https://www.data.go.kr/data/15004517/openapi.do']],
    related:[['거래 용어 빠른 사전','trade-terms'],['농산물 등급표 읽는 법','produce-grading'],['농산물 품목별 확인','produce-items']],
    boribay:'https://boribay.com/guides/garak-cabbage-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=pack_unit_terms',
    boribayText:'배추 10kg 그물망을 kg당으로 맞춰 보기',
    boribayDescription:'망·단·상자 이름을 kg당으로 바꿨다면 서울가락 해당 품목 표와 같은 단위로 대조하세요.'
  },
  'fruit-box-terms': {
    title:'제철 과일 상자: 4kg·7.5kg·10kg·5kg을 kg으로 읽는 법', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'샤인마스캇 4kg, 신고배 7.5kg, 홍로 10kg, 복숭아 4kg, 추희자두 5kg 상자 가격을 실중량 kg당으로 맞춰 시세와 비교하는 거래 용어입니다.',
    lead:'과일 상자 이름과 kg당은 다른 정보입니다. 4kg·7.5kg·10kg·5kg 가격을 시세처럼 쓰기 전에 포장재를 뺀 내용 중량으로 나누고, 품종명이 같은지 확인합니다.',
    sections:[
      ['샤인마스캇 4kg',['표시 4kg는 한 거래 단위의 이름입니다. 가격 비교에는 포도만의 실중량을 사용합니다.','캠벨·마스캇베리에이 행을 샤인마스캇 시세로 쓰지 않습니다. 알 빠짐 송이를 뺀 뒤에 kg당을 다시 계산합니다.'],['서울가락 샤인마스캇 4kg kg당 보기','https://boribay.com/guides/garak-grape-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=shine_muscat_4kg']],
      ['신고배 7.5kg',['7.5kg 상자와 15kg 상자·파렛트는 같은 행이 아닐 수 있습니다.','몇 과 세트 가격은 개당입니다. 개수를 kg으로 바꾸기 전에 과실 크기 구성이 같은지 확인합니다.'],['서울가락 신고배 7.5kg kg당 보기','https://boribay.com/guides/garak-pear-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=niitaka_pear_75kg']],
      ['홍로 10kg·복숭아 4kg·추희 5kg',['햇사과는 판매 문구이고 홍로는 품종명입니다. 10kg와 5kg를 같은 단가로 묶지 않습니다.','복숭아 숙도 표현은 경락가 표에 없습니다. 추희와 후무사·김천 산지 안내를 한 시세로 읽지 않습니다.'],['서울가락 홍로 10kg kg당 보기','https://boribay.com/guides/garak-apple-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=hongro_10kg']]
    ],
    faq:[['4kg 상자면 무조건 4로 나누면 되나요?','표시 중량이 내용물 실중량인지 먼저 확인합니다. 포장재 포함 총중량으로 나누면 kg당이 낮아져 시세와 어긋납니다.'],['선물 개수 가격을 kg당과 바로 비교해도 되나요?','개당과 kg당은 다른 단위입니다. 과실 무게 구성을 맞춘 뒤에만 비교합니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['서울특별시농수산식품공사 주요 품목 가격 항목','https://www.data.go.kr/data/15004517/openapi.do']],
    related:[['가을 과채 상자','produce-box-terms'],['포장 단위 그물망·단·상자','pack-unit-terms'],['거래 용어 빠른 사전','trade-terms']],
    boribay:'https://boribay.com/guides/garak-grape-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=fruit_box_terms',
    boribayText:'샤인마스캇 4kg를 kg당으로 맞춰 보기',
    boribayDescription:'상자 이름을 kg당으로 바꿨다면 서울가락 해당 과일 표와 같은 단위로 대조하세요.'
  },
  'produce-box-terms': {
    title:'가을 과채 상자: 8kg·5kg·3kg·통을 kg으로 읽는 법', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'네트계 멜론 8kg, 토마토 5kg, 하우스감귤 3kg, 수박 통, 대추방울 3kg, 생대추 2kg, 송본 단감 10kg 상자 가격을 실중량 kg당으로 맞춰 시세와 비교하는 거래 용어입니다.',
    lead:'과채 상자 이름과 kg당은 다른 정보입니다. 8kg·5kg·3kg·통 가격을 시세처럼 쓰기 전에 포장재를 뺀 내용 중량으로 나누고, 품목명·작형이 같은지 확인합니다.',
    sections:[
      ['네트계 멜론 8kg·수박 통',['표시 8kg는 한 거래 단위의 이름입니다. 가격 비교에는 멜론만의 실중량을 사용합니다. 8kg 상자와 파렛트, 참외를 한 단가로 묶지 않습니다.','수박 한 통 가격은 개당입니다. 과실 무게를 재기 전에 kg당 시세와 같다고 보지 않고, 꼭지절단 행과 일반 통을 나눕니다.'],['서울가락 네트계 멜론 8kg kg당 보기','https://boribay.com/guides/garak-melon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=netted_melon_8kg']],
      ['토마토 5kg·대추방울 3kg',['일반 토마토 5kg와 완숙·찰토마토, 방울토마토는 품목·품종이 다릅니다.','대추방울 3kg 가격을 완숙 토마토 5kg 행과 바로 비교하지 않습니다. 열과를 뺀 뒤에 kg당을 다시 계산합니다.'],['서울가락 토마토 5kg kg당 보기','https://boribay.com/guides/garak-tomato-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=tomato_5kg']],
      ['하우스감귤 3kg·생대추 2kg·송본 10kg',['하우스감귤 3kg·5kg·6kg와 몇 개입 선물을 한 단가로 묶지 않습니다. 수입 오렌지 시세를 감귤 시세로 쓰지 않습니다.','생대추와 건대추·사과대추, 송본 단감과 떫은감·곶감 원료를 나눕니다. 쥬키니 10kg와 애호박·단호박, 빨강 파프리카와 피망도 작형·색 행이 다릅니다.'],['서울가락 하우스감귤 3kg kg당 보기','https://boribay.com/guides/garak-citrus-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=house_citrus_3kg']]
    ],
    faq:[['8kg 상자면 무조건 8로 나누면 되나요?','표시 중량이 내용물 실중량인지 먼저 확인합니다. 포장재 포함 총중량으로 나누면 kg당이 낮아져 시세와 어긋납니다.'],['수박 한 통 가격을 kg당 표와 바로 비교해도 되나요?','통 무게를 잰 뒤에만 비교합니다. 꼭지절단·소형 수박 행과 일반 통을 한 숫자로 두지 않습니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['서울특별시농수산식품공사 주요 품목 가격 항목','https://www.data.go.kr/data/15004517/openapi.do']],
    related:[['제철 과일 상자','fruit-box-terms'],['포장 단위 그물망·단·상자','pack-unit-terms'],['거래 용어 빠른 사전','trade-terms']],
    boribay:'https://boribay.com/guides/garak-melon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_box_terms',
    boribayText:'네트계 멜론 8kg를 kg당으로 맞춰 보기',
    boribayDescription:'상자·통 이름을 kg당으로 바꿨다면 서울가락 해당 과채 표와 같은 단위로 대조하세요.'
  },
  'farm-waste-terms': {
    title:'영농폐기물 용어: 폐비닐·농약 빈 용기·공동집하장 구분', category:'농자재 · 분리배출', published:'2026-09-16', modified:'2026-09-16',
    description:'영농폐기물 수거 안내의 폐비닐, 농약 빈 용기, 재질별 분리, 공동집하장과 수거보상금의 뜻을 구분하고 지역에 확인할 항목을 정리합니다.',
    lead:'“농사에 쓰던 물건”과 “공동집하장에서 받는 품목”은 범위가 같지 않습니다. 품목 이름과 재질, 남은 내용물 여부를 먼저 구분해야 지역 담당자에게 정확히 문의할 수 있습니다.',
    sections:[
      ['영농폐기물과 수거 대상',['한국환경공단의 영농폐기물 수거·처리사업은 영농 폐비닐과 농약 용기를 대상으로 안내합니다. 농장에서 나온 모든 자재가 같은 수거 경로에 포함된다고 해석하지 않습니다.','부직포·차광막·영양제 용기처럼 구분이 애매한 물건은 품목명과 사진을 준비해 지자체에 배출 방법을 확인합니다. 재활용 가능한 재질처럼 보여도 공동집하장 접수 여부는 별개입니다.']],
      ['폐비닐의 재질별·색상별 분리',['재질별 분리는 비닐을 사용 장소 하나로 묶지 않고 재질 구분에 맞추는 것입니다. 공단 안내에는 하우스용·멀칭용 로덴·하이덴 구분이 나옵니다.','색상별 분리는 흰색·검정색 등을 섞지 않는 구분입니다. 재질을 모르면 임의로 분류하지 말고 제품 표시나 사진으로 수거 담당자에게 확인합니다.']],
      ['농약 빈 용기와 잔류 농약',['농약 빈 용기는 내용물을 사용한 뒤 남은 용기·포장재를 뜻합니다. 공단 안내는 유리병·플라스틱·봉지류를 구분합니다.','내용물이 남았거나 제품을 알 수 없는 용기는 빈 용기와 구분해 담당기관에 문의합니다. 임의로 내용물을 버려 빈 용기로 만들지 않습니다.']],
      ['공동집하장·수거 일정·보상금',['공동집하장은 분리한 영농폐기물을 모아 수거를 기다리는 장소입니다. 주소가 있다는 것만으로 모든 품목을 언제든 반입할 수 있다는 뜻은 아닙니다.','반입 전 확인할 항목은 받는 품목, 분리·묶음 기준, 이용 대상, 반입 가능 시점과 연락처입니다. 수거일과 개별 반입 가능일도 구분해서 묻습니다.','수거보상금은 자재를 일반 중고상품처럼 판매하는 가격과 다릅니다. 지급 대상·금액·신청 방법은 해당 지역의 현재 안내로 확인합니다.']]
    ],
    faq:[['영양제병을 농약 빈병과 함께 내도 되나요?','겉모양이 같아도 내용물 표시와 수거 분류가 다를 수 있습니다. 농약 용기로 임의 분류하지 말고 해당 지자체의 안내를 확인합니다.'],['지도에 공동집하장이 나오면 바로 가져가도 되나요?','먼저 실제 이용 가능 여부와 접수 품목을 확인합니다. 위치 정보는 출발점이며 현장 운영·수거 일정 확인을 대신하지 않습니다.']],
    sources:[['한국환경공단 영농폐기물 수거·처리사업','https://www.keco.or.kr/web/lay1/S1T185C1072/contents.do'],['한국환경공단 영농폐기물 수거 대상 FAQ','https://www.keco.or.kr/group06/lay1/bbs/S301T832C915/A/182/view.do?article_seq=43847']],
    related:[['비료 사용 전 확인','fertilizer-use'],['농기계 거래 기본','farm-machinery'],['거래 용어 빠른 사전','trade-terms']],
    boribay:'https://boribay.com/guides/farm-supplies-disposal-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=farm_waste_terms',boribayText:'분류한 품목의 배출 방법과 지역 집하장 찾기',boribayDescription:'품목과 남은 내용물 여부를 정리했다면 배출 안내와 지역 공동집하장 위치를 확인하세요.'
  },
  'produce-items': {
    title:'농산물 품목별 거래 확인 순서', category:'품목',
    description:'감자, 양파, 쌀, 사과, 복숭아 등 농산물 직거래에서 품종·산지·수확일·등급·실중량·보관·배송을 확인하는 공통 순서입니다.',
    lead:'품목마다 세부 기준은 다르지만 거래 전에 확인할 뼈대는 같습니다. 품종과 산지에서 시작해 수확·선별·중량·보관·배송·분쟁 기준까지 순서대로 묻습니다.',
    sections:[['품목과 생산 정보',['정확한 품목·품종·생산지와 생산자·판매자 관계를 확인합니다.','수확일, 재배 방식, 선별일과 현재 보관 상태를 묻습니다.']],['상품과 가격 정보',['등급·크기·개수·실중량을 같은 단위로 비교합니다.','배송비·포장비·수수료를 포함한 kg당 또는 개당 가격을 계산합니다.']],['인도와 문제 처리',['발송 예정일, 운송 방식, 신선도 유지 포장과 수령 직후 확인 방법을 정합니다.','파손·부패·중량 부족 시 사진 기준과 환불·재배송 조건을 합의합니다.']]],
    sources:[['국립농산물품질관리원','https://www.naqs.go.kr/'],['KAMIS 농산물유통정보','https://www.kamis.or.kr/']],related:[['감자 특품 기준','potato-special-grade'],['농산물 등급표 읽는 법','produce-grading'],['농산물 보관·출하 기본','storage-shipping']],boribay:'https://boribay.com/guides/agricultural-direct-market-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_items',boribayText:'농산물 직거래장터 이용 원리 보기'
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
  const sectionHtml=page.sections.map((section,index)=>`<section class="content-section"><h2><span>${index+1}</span>${escapeHtml(section[0])}</h2><ul class="check-list">${section[1].map(item=>`<li>${icon('circle-check-big')}<span>${escapeHtml(item)}</span></li>`).join('')}</ul>${section[2]?`<p class="context-reference"><a href="${escapeHtml(section[2][1])}">${escapeHtml(section[2][0])} ${icon('arrow-right')}</a></p>`:''}</section>`).join('');
  const faqHtml=page.faq?`<section class="content-section"><h2>자주 묻는 질문</h2><dl class="faq-list">${page.faq.map(([question,answer])=>`<dt>${escapeHtml(question)}</dt><dd>${escapeHtml(answer)}</dd>`).join('')}</dl></section>`:'';
  const relatedHtml=page.related.map(([label,path])=>`<a href="/knowledge/${path}">${escapeHtml(label)}</a>`).join('');
  const sourcesHtml=page.sources.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ${icon('external-link')}</a>`).join('');
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:page.title,description:page.description,datePublished:page.published||'2026-08-09',dateModified:page.modified||'2026-08-10',inLanguage:'ko-KR',mainEntityOfPage:canonical,author:{'@type':'Organization',name:'요미위키 편집팀'},publisher:{'@type':'Organization',name:'요미위키',url:'https://yomiwiki.com/'}}).replace(/</g,'\\u003c');
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(page.title)} | 요미위키</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(page.title)} | 요미위키"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="/knowledge.css?v=3.0.0"><script type="application/ld+json">${schema}</script></head><body><header class="site-header"><div class="header-inner"><a class="brand" href="/"><span class="brand-mark">${icon('sprout')}</span><strong>요미위키</strong></a><nav class="top-nav"><a href="/knowledge/produce-items">${icon('wheat')}품목</a><a href="/knowledge/produce-grading">${icon('notebook-tabs')}등급·선별</a><a href="/knowledge/storage-shipping">${icon('warehouse')}보관·출하</a><a href="/knowledge/farm-machinery">${icon('tractor')}농기계</a><a href="/knowledge/trade-terms">${icon('book-open')}거래용어</a></nav></div></header><main><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a>${icon('chevron-right')}<span>${escapeHtml(page.category)}</span></nav><article><header class="article-head"><p class="article-kicker">${icon('book-check')}${escapeHtml(page.category)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><div class="article-meta"><span>${icon('calendar-days')}수정일 ${escapeHtml(page.modified||'2026-08-10')}</span><span>${icon('refresh-cw')}공식 자료 확인</span><span>${icon('shield-check')}광고와 편집 분리</span></div></header><div class="article-grid"><div><section class="lead-box"><strong>먼저 알아두세요</strong><p>${escapeHtml(page.lead)}</p></section>${sectionHtml}${faqHtml}<section class="source-box"><h2>확인한 공식 자료</h2>${sourcesHtml}<p>공식 기준은 개정될 수 있습니다. 실제 거래·사용 전 최신 원문과 지역 담당기관 안내를 다시 확인하세요.</p></section></div><aside class="rail"><section><h2>관련 문서</h2><nav>${relatedHtml}</nav></section><section class="boribay-box"><h2>거래 준비로 이어가기</h2><p>${escapeHtml(page.boribayDescription||'기준을 확인했다면 같은 조건의 시세와 직거래 확인 순서를 이어서 보세요.')}</p><a href="${escapeHtml(page.boribay)}">${escapeHtml(page.boribayText)} ${icon('arrow-right')}</a><span class="notice">외부 안내 링크에는 유입 경로 측정값이 포함됩니다. 요미위키는 해당 서비스와 제휴하지 않습니다.</span></section></aside></div></article></main><footer class="site-footer"><div><span>© 2026 요미위키 · 농산물·농기계 거래 지식사전</span><nav><a href="/about">소개</a><a href="/editorial-policy">편집 원칙</a><a href="/privacy">개인정보</a><a href="/contact">문의</a></nav></div></footer><script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script><script>if(window.lucide)lucide.createIcons();document.querySelectorAll('a[href*="boribay.com"]').forEach(a=>a.addEventListener('click',()=>window.gtag&&gtag('event','owned_referral_click',{source_domain:'yomiwiki.com',destination:a.href})));</script></body></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8','Cache-Control':'public,max-age=0,must-revalidate'}});
}
