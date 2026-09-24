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
    related:[['표준규격품 포장표시 대조','produce-label-check'],['감자 특품 기준','potato-special-grade'],['거래 용어 빠른 사전','trade-terms']], boribay:'https://boribay.com/guides/produce-price-calculator?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_grading',boribayText:'등급을 맞춘 뒤 kg당 가격 계산하기'
  },
  'produce-label-check': {
    title:'표준규격품 포장표시와 판매글을 대조하는 법', category:'등급·포장·거래용어', published:'2026-09-24', modified:'2026-09-24', sourceChecked:'2026-09-24',
    description:'표준규격품 포장 사진과 온라인 판매글의 품목·산지·품종·등급·무게·생산자 정보를 한 칸씩 대조하는 실전 표입니다.',
    lead:'포장 사진과 판매글이 같은 물량을 설명하는지 확인하려면 먼저 표준규격품 표시 여부를 봅니다. 국립농산물품질관리원의 표준규격품 표시 항목을 대조 기준으로 사용하되, 표준규격품이 아닌 모든 농산물에 똑같은 표시 의무가 있다고 단정하지 않습니다.',
    sections:[
      ['먼저 적용 범위 확인',['포장에 “표준규격품” 표시가 있는지 확인합니다. 이 글의 항목표는 국립농산물품질관리원이 설명하는 표준규격품 표시 기준입니다.','그 표시가 없다면 아래 표를 거래 정보 확인용 질문으로만 사용하고, 곧바로 법 위반이라고 판단하지 않습니다.']],
      ['포장 사진과 판매글의 여섯 칸 맞추기',['① 품목 ② 산지 ③ 품종 ④ 등급 ⑤ 무게 또는 개수 ⑥ 생산자 또는 생산자단체(판매자)의 명칭·전화번호를 포장 사진에서 읽습니다. 국립농산물품질관리원 자료에는 식품 안전 문구(세척 또는 가열)도 표시사항으로 안내되어 있으니 함께 확인합니다.','판매글에도 같은 여섯 칸이 있는지 표시하고, 서로 다른 칸은 판매자에게 다시 확인합니다. 품목과 품종, 산지와 발송지, 포장 단량과 내용물 실중량을 같은 말로 취급하지 않습니다.','등급규격은 품질 구분이고 포장규격은 거래단위·포장·표시사항입니다. 같은 “특”이어도 품종·단량이 다르면 같은 조건의 가격으로 비교할 수 없습니다.']],
      ['예시: 불일치가 생겼을 때',['가상의 판매글에는 “배 7.5kg, 특”이라고 적혀 있고 포장 사진에는 품종·등급이 다른 물량으로 보인다면, 가격부터 비교하지 말고 이번 주문에 실제 출하할 상자의 라벨 사진을 다시 요청합니다.','사진만으로 그 물건이 가짜라고 판정하지 않습니다. 과거 사진을 올렸거나 다른 규격을 함께 취급할 수 있으므로 이번 물량의 품종·등급·무게와 출하일을 서면으로 확인합니다.']],
      ['메모해서 보내는 확인 질문',['“이번에 보내는 상자의 품목·품종·산지·등급·내용량은 각각 무엇인가요? 포장 사진과 판매글의 다른 칸은 어느 정보가 맞나요?”라고 묻습니다.','대답과 수정된 판매 조건을 남기고, 서로 다른 품종·등급·단량의 가격을 하나의 kg당 값으로 합치지 않습니다.']]
    ],
    faq:[['표준규격품 표시가 없으면 바로 불량 상품인가요?','아닙니다. 이 글의 여섯 칸은 표준규격품 표시 항목입니다. 표시 여부만으로 일반 농산물의 품질이나 위법 여부를 단정하지 않습니다.'],['사진에 “특”이 있으면 가격 비교를 시작해도 되나요?','품종, 산지, 무게 또는 개수가 같은지 먼저 확인하세요. 등급명 하나만 같아서는 같은 조건의 상자가 아닙니다.']],
    sources:[['국립농산물품질관리원 농산물 표준규격제도·구성 및 표시사항','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN40333']],
    related:[['농산물 등급표 읽는 법','produce-grading'],['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['그물망·단·상자를 kg으로 읽는 법','pack-unit-terms']],
    boribay:'https://boribay.com/guides/produce-direct-shipping-buying-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_label_check',
    boribayText:'포장표시 확인 뒤 산지직송 구매 조건 대조하기',
    boribayDescription:'포장과 판매글이 맞는지 확인했다면 이번 거래의 발송·수령 조건을 이어서 점검하세요.'
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
      ['양파 15kg 망',['양파 15kg 그물망은 저장양파와 햇양파·품종을 같은 행으로 묶지 않습니다. 부패·발근 구를 뺀 판매 가능 중량으로 다시 나누면 kg당이 달라집니다.','망 가격을 양파 실중량으로 나눈 뒤에만 서울가락 양파 행과 대조합니다.'],['서울가락 양파 15kg 망 kg당 보기','https://boribay.com/guides/garak-onion-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=onion_mesh_kg']],
      ['김장무 20kg 상자',['김장무 20kg 상자는 출하 단위이고 심는 시기 안내는 파종 판단입니다. 상자 표시가 무 실중량인지 총중량인지 확인합니다.','열무·알타리와 김장무를 한 시세로 읽지 않습니다. 홍로 10kg 상자 시세는 과일 상자 용어에서 품종명과 실중량으로 맞춥니다.'],['서울가락 김장무 20kg 상자 kg당 보기','https://boribay.com/guides/garak-radish-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=kimjang_radish_20kg']]
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
      ['홍로 10kg',['햇사과는 판매 문구이고 홍로는 품종명입니다. 10kg 상자와 개수 세트를 같은 단가로 묶지 않습니다.','품종명과 실중량을 나눈 뒤에만 서울가락 홍로 행과 대조합니다.'],['서울가락 홍로 10kg kg당 보기','https://boribay.com/guides/garak-apple-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=hongro_10kg']],
      ['복숭아 4kg',['복숭아 숙도 표현은 경락가 표에 없습니다. 4kg 상자 가격을 숙도 문구만으로 시세처럼 쓰지 않습니다.','백도·황도 행을 한 평균 kg당으로 합치지 않습니다.'],['서울가락 복숭아 4kg kg당 보기','https://boribay.com/guides/garak-peach-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=peach_4kg']],
      ['추희자두 5kg',['추희와 후무사·김천 산지 안내를 한 시세로 읽지 않습니다.','5kg 상자 표시가 자두 실중량인지 확인한 뒤에 kg당으로 나눕니다.'],['서울가락 추희자두 5kg kg당 보기','https://boribay.com/guides/garak-plum-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=plum_5kg']]
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
      ['네트계 멜론 8kg',['표시 8kg는 한 거래 단위의 이름입니다. 가격 비교에는 멜론만의 실중량을 사용합니다. 8kg 상자와 파렛트, 참외를 한 단가로 묶지 않습니다.'],['서울가락 네트계 멜론 8kg kg당 보기','https://boribay.com/guides/garak-melon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=netted_melon_8kg']],
      ['수박 통',['수박 한 통 가격은 개당입니다. 과실 무게를 재기 전에 kg당 시세와 같다고 보지 않고, 꼭지절단 행과 일반 통을 나눕니다.'],['서울가락 수박 통·상자 kg당 보기','https://boribay.com/guides/garak-watermelon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=watermelon_piece']],
      ['토마토 5kg',['일반 토마토 5kg와 완숙·찰토마토, 방울토마토는 품목·품종이 다릅니다. 열과를 뺀 뒤에 kg당을 다시 계산합니다.'],['서울가락 토마토 5kg kg당 보기','https://boribay.com/guides/garak-tomato-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=tomato_5kg']],
      ['대추방울 3kg',['대추방울 3kg 가격을 완숙 토마토 5kg 행과 바로 비교하지 않습니다.'],['서울가락 대추방울 3kg kg당 보기','https://boribay.com/guides/garak-cherry-tomato-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=cherry_tomato_3kg']],
      ['하우스감귤 3kg',['하우스감귤 3kg·5kg·6kg와 몇 개입 선물을 한 단가로 묶지 않습니다. 수입 오렌지 시세를 감귤 시세로 쓰지 않습니다.'],['서울가락 하우스감귤 3kg kg당 보기','https://boribay.com/guides/garak-citrus-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=house_citrus_3kg']],
      ['생대추 2kg',['생대추와 건대추·사과대추를 한 숫자로 두지 않습니다.'],['서울가락 생대추 2kg kg당 보기','https://boribay.com/guides/garak-jujube-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=jujube_2kg']],
      ['송본 단감 10kg',['송본 단감과 떫은감·곶감 원료를 나눕니다.','송본·태추와 10kg·소포장은 같은 행이 아닙니다.'],['서울가락 송본 단감 10kg kg당 보기','https://boribay.com/guides/garak-persimmon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=persimmon_10kg']],
      ['쥬키니 10kg',['쥬키니 10kg와 애호박 8kg·단호박 3kg는 작형이 다릅니다. 상자 이름을 kg당으로 나누기 전에 작형명을 맞춥니다.'],['서울가락 쥬키니 10kg kg당 보기','https://boribay.com/guides/garak-pumpkin-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=zucchini_10kg']],
      ['곶감용 떫은감 5kg',['떫은감은 단감과 다른 품목입니다. 완성 곶감 판매가를 원료 떫은감 시세로 쓰지 않습니다.'],['서울가락 곶감용 떫은감 5kg kg당 보기','https://boribay.com/guides/garak-astringent-persimmon-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=astringent_persimmon_5kg']],
      ['빨강 파프리카 5kg',['빨강·노랑 5kg와 피망 10kg는 색·품목이 다릅니다. 한 평균 kg당으로 합치지 않습니다.'],['서울가락 빨강 파프리카 5kg kg당 보기','https://boribay.com/guides/garak-paprika-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=red_paprika_5kg']]
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
    sources:[['국립농산물품질관리원','https://www.naqs.go.kr/'],['KAMIS 농산물유통정보','https://www.kamis.or.kr/']],related:[['감자 특품 기준','potato-special-grade'],['농산물 등급표 읽는 법','produce-grading'],['농산물 보관·출하 기본','storage-shipping']],boribay:'https://boribay.com/guides/produce-price-calculator?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=produce_items',boribayText:'품목 실중량으로 kg당 가격 계산하기'
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
    title:'비료 사용 전 확인: 토양검정·성분량·살포 기록', category:'농자재',description:'비료를 사용하기 전에 작물과 생육 단계, 토양검정, 제품 성분과 표시사항, 살포 조건, 사용 기록을 확인하는 기본 순서입니다.',lead:'비료는 제품 이름보다 성분량과 작물·토양 상태를 기준으로 판단합니다. 포장 표시와 지역 농업기술센터 처방을 우선하고, 관행량을 그대로 반복하지 않습니다.',sections:[['토양과 작물 확인',['토양검정 결과와 작물의 생육 단계·재배 목표를 확인합니다.','질소·인산·칼리와 미량요소의 현재 상태를 봅니다.']],['제품 표시 읽기',['보증 성분량, 대상 작물, 사용량, 사용 시기, 주의사항을 확인합니다.','같은 상표라도 성분비가 다를 수 있어 포대 표시를 사진으로 남깁니다.']],['살포와 기록',['강풍·폭우 전 살포를 피하고 보호장비와 살포기 설명을 지킵니다.','제품명·사용량·사용일·포장을 기록하고 남은 제품은 건조하게 보관합니다.']]],sources:[['농촌진흥청 농사로','https://www.nongsaro.go.kr/'],['흙토람 토양환경정보시스템','https://soil.rda.go.kr/']],related:[['농산물 품목별 확인','produce-items'],['농산물 보관·출하 기본','storage-shipping'],['농기계 거래 기본','farm-machinery']],    boribay:'https://boribay.com/?query=%EB%B9%84%EB%A3%8C&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_article&utm_content=fertilizer_use',boribayText:'농자재 지역 거래 준비 보기'
  },
  'listing-field-terms': {
    title:'수확일·실중량·품종 칸이 뜻하는 것', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'농산물 직거래 판매글에서 수확일, 실중량, 품종 칸이 각각 무엇을 가리키는지 구분하는 용어입니다.',
    lead:'판매글의 세 칸은 소개 문장과 다릅니다. 품종은 낸 작물의 이름, 실중량은 포장재를 뺀 내용 kg, 수확일은 실제로 딴 날입니다. 품목 통칭·망 이름·사진 촬영일과 바꿔 읽지 않습니다.',
    sections:[
      ['품종 칸',['품종은 실제 재배·출하한 작물 이름입니다. 배추·사과처럼 품목만 적으면 같은 글을 비교할 수 없습니다.','모르는 품종을 추측해 채우지 않습니다. 확인할 수 없으면 미확인으로 두고 그 칸을 빈 채 올리지 않습니다.']],
      ['실중량 칸',['실중량은 포장재를 뺀 농산물 내용 kg입니다. 10kg 망·상자 이름은 포장 단위이지 실중량이 아닙니다.','총중량과 내용량을 한 칸에 넣지 않습니다. 여러 규격이면 글도 나눕니다.']],
      ['수확일 칸',['수확일은 실제로 딴 날짜입니다. 오늘 찍은 사진의 촬영일과 같은 칸에 두지 않습니다.','아직 밭에 있으면 출하 가능일을 수확일로 바꿔 쓰지 않습니다.']]
    ],
    faq:[['상자 이름만 적어도 실중량인가요?','상자 이름은 포장 단위입니다. 비교하려면 내용 kg를 따로 적습니다.'],['품종을 모르면 비슷한 이름을 넣어도 되나요?','추측 품종은 다른 물건이 됩니다. 미확인으로 둡니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['국립농산물품질관리원','https://www.naqs.go.kr/']],
    related:[['표준규격품 포장표시 대조','produce-label-check'],['우리 동네·산지·발송지를 구분하는 말','region-listing-terms'],['출하가능일·수확일·도정일','listing-date-terms']],
    boribay:'https://boribay.com/guides/produce-listing-three-fields?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=listing-field-terms',
    boribayText:'품종·실중량·수확일 칸을 채워 판매글 올리기',
    boribayDescription:'세 칸의 뜻을 나눴다면 같은 칸으로 판매글을 올리세요.'
  },
  'machinery-listing-terms': {
    title:'명판·시간계·작업기 포함의 뜻', category:'농기계', published:'2026-09-20', modified:'2026-09-20',
    description:'중고 농기계 판매글에서 명판 형식명, 시간계 숫자, 작업기 포함이 각각 무엇을 가리키는지 구분하는 용어입니다.',
    lead:'기계 글의 세 칸은 제조사 통칭과 다릅니다. 명판은 본체에 붙은 형식명, 시간계는 시동 전 숫자, 작업기 포함은 같이 넘기는 장비입니다. 생활가전·기타중고 칸의 한 줄 설명과 바꿔 읽지 않습니다.',
    sections:[
      ['명판',['명판은 본체에 붙은 제조사·형식명·제조번호입니다. 대동·LS 같은 통칭만으로는 같은 기계가 아닙니다.','공개 글에는 형식명을 적고, 전체 제조번호는 실물 대조용으로 일부를 가릴 수 있습니다.']],
      ['시간계',['시간계는 계기판의 누적 숫자입니다. 적게 썼다는 말은 숫자가 아닙니다.','시동 전에 읽은 값과 정비 영수증의 시간이 다르면 미확인으로 둡니다.']],
      ['작업기 포함',['작업기 포함은 로더·로터리처럼 본체와 같이 넘기는 장비입니다. 포함되지 않는 작업기를 장점으로 적지 않습니다.','본체 가격과 작업기 가격을 한 칸에 숨기지 않습니다.']],
      ['생활가전 칸과의 차이',['트랙터가 생활가전·기타중고·취미 칸에 있으면 형식명이 묻힙니다. 명판·시간·작업기 칸이 보이는 농기계 칸의 글만 같은 기계로 읽습니다.','칸이 다른 글을 한 가격으로 대조하지 않습니다.']]
    ],
    faq:[['마력만 있으면 형식명을 생략해도 되나요?','마력대는 출력을 가리킵니다. 같은 마력이라도 형식명이 다르면 다른 기계입니다.'],['작업기를 나중에 적어도 포함인가요?','적히지 않은 작업기는 포함이 아닙니다.']],
    sources:[['농촌진흥청 농사로 농업기계','https://www.nongsaro.go.kr/'],['농업기계 안전정보시스템','https://amis.rda.go.kr/']],
    related:[['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['지역 매물과 탁송 매물을 가리는 말','nearby-machinery-terms'],['개인 직거래와 입점몰 입점의 차이','c2c-vs-mall-terms']],
    boribay:'https://boribay.com/guides/used-machinery-listing-nameplate?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=machinery-listing-terms',
    boribayText:'명판·시간·작업기 칸을 채워 기계 글 올리기',
    boribayDescription:'세 칸의 뜻을 나눴다면 같은 칸으로 기계 글을 올리세요.'
  },
  'region-listing-terms': {
    title:'우리 동네·산지·발송지를 구분하는 말', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'근처 농산물 글에서 우리 동네, 산지, 택배 발송지가 같은 장소가 아님을 구분하는 용어입니다.',
    lead:'지역 칸은 직매장 안내가 아닙니다. 우리 동네는 방문할 거래 장소, 산지는 난 곳, 발송지는 택배가 나가는 곳입니다. 셋이 같다는 말은 따로 확인하기 전에는 쓰지 않습니다.',
    sections:[
      ['우리 동네',['우리 동네는 구매자가 가서 받을 수 있는 거래 장소입니다. 판매자 주소만으로 근처라고 읽지 않습니다.','장소가 없으면 근처 글이 아닙니다.']],
      ['산지',['산지는 작물이 난 지역입니다. 산지와 만나 장소가 다를 수 있습니다.','산지 통칭만 있고 거래 장소가 없으면 방문 조건이 아닙니다.']],
      ['발송지',['발송지는 택배가 나가는 곳입니다. 산지와 물류지가 다를 수 있습니다.','방문 수령 글에 발송지만 적혀 있으면 근처 글이 아닙니다.']]
    ],
    faq:[['산지가 가까우면 우리 동네 글인가요?','산지와 거래 장소는 다를 수 있습니다. 방문할 장소가 적힌 글만 근처로 읽습니다.'],['지역이 없는 글은요?','근처 조건이 아니므로 후보에서 뺍니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['국립농산물품질관리원','https://www.naqs.go.kr/']],
    related:[['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['지역 매물과 탁송 매물을 가리는 말','nearby-machinery-terms'],['방문수령·산지직송·계근 시점','meetup-parcel-terms']],
    boribay:'https://boribay.com/guides/nearby-produce-listing-search?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=region-listing-terms',
    boribayText:'산지·수확일로 근처 농산물 글 찾기',
    boribayDescription:'지역 칸의 뜻을 나눴다면 같은 조건의 근처 농산물 글을 찾으세요.'
  },
  'nearby-machinery-terms': {
    title:'지역 매물과 탁송 매물을 가리는 말', category:'농기계', published:'2026-09-20', modified:'2026-09-20',
    description:'중고 트랙터·관리기 글에서 근처 인도와 탁송을 같은 지역 매물로 읽지 않게 구분하는 용어입니다.',
    lead:'기계의 지역 칸은 판매자 주소만으로 정하지 않습니다. 근처 매물은 가서 시동을 확인할 수 있는 인도 장소가 있는 글이고, 탁송 매물은 상차 장소와 운송이 따로 적힌 글입니다.',
    sections:[
      ['지역 매물',['지역 매물은 거래 장소에서 자력 확인이 가능한 글입니다. 명판·시간계·작업기 칸이 같아야 같은 기계입니다.','마력대만 같고 장소가 없으면 근처가 아닙니다.']],
      ['탁송 매물',['탁송은 상차·운송·하차가 따로 있는 인도입니다. 판매자 주소와 상차 장소가 다를 수 있습니다.','탁송 비용이 본기 가격에 포함됐는지는 별도 칸입니다.']],
      ['거리를 고르는 말',['거리는 인도 장소까지의 동선입니다. 사진 속 배경만으로 근처라고 읽지 않습니다.','작업기 포함 여부가 다른 글을 같은 거리 비교에 넣지 않습니다.']]
    ],
    faq:[['판매자 동네가 가까우면 지역 매물인가요?','인도 장소가 적힌 글만 지역 매물로 읽습니다.'],['탁송이면 시운전은 생략하나요?','탁송이어도 상차 전 상태를 확인하는 말이 따로 있어야 합니다.']],
    sources:[['농촌진흥청 농사로 농업기계','https://www.nongsaro.go.kr/'],['농업기계 안전정보시스템','https://amis.rda.go.kr/']],
    related:[['명판·시간계·작업기 포함의 뜻','machinery-listing-terms'],['우리 동네·산지·발송지를 구분하는 말','region-listing-terms'],['개인 직거래와 입점몰 입점의 차이','c2c-vs-mall-terms']],
    boribay:'https://boribay.com/guides/nearby-used-tractor-search?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=nearby-machinery-terms',
    boribayText:'작업기·거리로 근처 트랙터 글 찾기',
    boribayDescription:'지역과 탁송을 나눴다면 같은 칸의 근처 기계 글을 찾으세요.'
  },
  'meetup-parcel-terms': {
    title:'방문수령·산지직송·계근 시점', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'농산물 직거래에서 방문수령, 산지직송, 계근 시점이 각각 어느 장소와 날짜를 가리키는지 구분하는 용어입니다.',
    lead:'만나기와 택배는 한 평균 비용이 아닙니다. 방문수령은 가서 받는 날, 산지직송은 출하일 이후 도착, 계근 시점은 무게를 재는 때입니다. 세 말을 한 칸에 섞지 않습니다.',
    sections:[
      ['방문수령',['방문수령은 거래 장소에서 받아 가는 방법입니다. 오늘 갈 수 있는 시간과 장소가 칸에 있어야 합니다.','아직 따기 전이면 방문 날짜를 수확일로 바꿔 쓰지 않습니다.']],
      ['산지직송',['산지직송은 출고 후 택배로 보내는 방법입니다. 출하일이 없으면 직송 조건이 아닙니다.','산지와 물류 발송지가 다를 수 있어 발송지를 따로 읽습니다.']],
      ['계근 시점',['계근은 무게를 재는 때입니다. 밭에서 달 때와 출고 전 상자 무게는 다를 수 있습니다.','방문이면 현장 계근, 택배면 출고 전 기준을 어느 칸에 적었는지 봅니다.']]
    ],
    faq:[['둘 다 가능하면 한 칸에 적어도 되나요?','이번 물량이 방문인지 택배인지 하나만 적습니다. 고르지 않은 방법은 장점이 아닙니다.'],['출하일 없는 택배 글은요?','산지직송 조건으로 읽지 않습니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['국립농산물품질관리원','https://www.naqs.go.kr/']],
    related:[['우리 동네·산지·발송지를 구분하는 말','region-listing-terms'],['출하가능일·수확일·도정일','listing-date-terms'],['전량매입·제3자 계좌·운송비 선송금','bulk-buyer-terms']],
    boribay:'https://boribay.com/guides/meetup-vs-direct-shipping-choice?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=meetup-parcel-terms',
    boribayText:'만나기 또는 택배를 고른 뒤 글에 적기',
    boribayDescription:'세 말의 뜻을 나눴다면 이번 물량의 수령 방법을 칸에 적으세요.'
  },
  'bulk-buyer-terms': {
    title:'전량매입·제3자 계좌·운송비 선송금', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'직거래 판매글에 오는 전량매입, 제3자 명의 계좌, 운송비 선송금이 각각 무엇을 가리키는지 구분하는 용어입니다.',
    lead:'전량 살게요는 재고를 한꺼번에 사겠다는 말일 뿐, 입금과 인도가 끝났다는 뜻이 아닙니다. 제3자 계좌는 판매자 명의가 아닌 입금처이고, 운송비 선송금은 물건을 보기 전에 보내는 돈입니다.',
    sections:[
      ['전량매입',['전량매입은 남은 물량 전부를 사겠다는 의사입니다. 수량·단가·수령 방법이 칸에 없으면 거래 조건이 아닙니다.','글을 내리라는 요청과 전량매입은 다른 말입니다. 조건을 적기 전에 글을 내리지 않습니다.']],
      ['제3자 계좌',['제3자 계좌는 판매자 이름과 다른 명의의 입금처입니다. 회사·기사·지인 명의를 같은 판매자 계좌로 읽지 않습니다.','입금처가 바뀌면 이전 대화를 이어서 진행하지 않습니다.']],
      ['운송비 선송금',['운송비 선송금은 실물을 확인하기 전에 보내는 운임입니다. 방문 수령·출고 전 계근과 같은 칸에 두지 않습니다.','운임을 먼저 보내야만 물건을 볼 수 있다는 말은 인도 조건이 아닙니다.']]
    ],
    faq:[['전량을 산다는데 글을 내려도 되나요?','입금과 인도 칸이 채워지기 전에는 내리지 않습니다.'],['기사 명의 계좌면 운송비인가요?','명의가 판매자와 다르면 제3자 계좌입니다. 운임 칸과 섞지 않습니다.']],
    sources:[['경찰청 사이버수사','https://www.police.go.kr/'],['금융감독원 금융사기 예방','https://www.fss.or.kr/']],
    related:[['방문수령·산지직송·계근 시점','meetup-parcel-terms'],['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['개인 직거래와 입점몰 입점의 차이','c2c-vs-mall-terms']],
    boribay:'https://boribay.com/guides/fake-bulk-buyer-seller-stop?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=bulk-buyer-terms',
    boribayText:'전량 살게요가 오면 멈추는 순서 보기',
    boribayDescription:'세 말을 나눴다면 칸이 비는 요청에서는 멈추세요.'
  },
  'c2c-vs-mall-terms': {
    title:'개인 직거래와 입점몰 입점의 차이', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'개인 직거래 판매글과 입점몰 상세페이지가 같은 칸을 쓰지 않음을 구분하는 용어입니다.',
    lead:'입점몰은 상세페이지·재고·결제 칸이 있고, 개인 글은 판매자와 수령 조건이 글에 있어야 합니다. 몰 문장을 개인 글에 붙여 넣어도 같은 거래가 되지 않습니다.',
    sections:[
      ['개인 직거래 글',['개인 글은 이번 물량의 품종·실중량·수확일 또는 명판·시간·작업기가 칸에 있어야 합니다.','수령 방법과 거래 장소가 글에 없으면 개인 직거래 조건이 아닙니다.']],
      ['입점몰 입점',['입점은 몰의 상품 등록·정산 칸을 쓰는 방식입니다. 개인 글의 방문 수령과 같은 말이 아닙니다.','몰 재고 문구를 개인 글의 출하일로 바꿔 읽지 않습니다.']],
      ['한 목록에서 고르는 말',['농산물 칸과 농기계 칸은 필수 항목이 다릅니다. 한 글에 섞지 않습니다.','지금 할 일이 팔기·찾기이면 시세 표를 목적지로 두지 않습니다.']]
    ],
    faq:[['몰 상품 설명을 개인 글에 복사해도 되나요?','결제·반품 칸이 다릅니다. 개인 글에는 이번 물량의 칸만 적습니다.'],['한 글에 농산물과 기계를 같이 올려도 되나요?','칸이 다르므로 글을 나눕니다.']],
    sources:[['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614'],['국립농산물품질관리원','https://www.naqs.go.kr/']],
    related:[['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['명판·시간계·작업기 포함의 뜻','machinery-listing-terms'],['지역 매물과 탁송 매물을 가리는 말','nearby-machinery-terms']],
    boribay:'https://boribay.com/guides/produce-and-machinery-one-list?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=c2c-vs-mall-terms',
    boribayText:'개인 직거래 글로 올리거나 찾기',
    boribayDescription:'개인 글과 몰 상세를 나눴다면 해당 칸으로 올리거나 찾으세요.'
  },
  'listing-date-terms': {
    title:'출하가능일·수확일·도정일', category:'거래용어', published:'2026-09-20', modified:'2026-09-20',
    description:'김장·햅쌀 판매글에서 출하 가능일, 수확일, 도정일이 같은 날짜가 아님을 구분하는 용어입니다.',
    lead:'출하 가능일은 넘길 수 있는 날, 수확일은 실제로 딴 날, 도정일은 포장에 적힌 도정연월일입니다. 절임배추 도착일과 당일도정 문구와 바꿔 읽지 않습니다.',
    sections:[
      ['출하 가능일',['출하 가능일은 구매자에게 넘길 수 있는 날입니다. 아직 밭에 있는 날을 수확일로 바꿔 쓰지 않습니다.','몰의 배송 도착 예정일과 같은 칸에 두지 않습니다.']],
      ['수확일',['수확일은 실제로 딴 날짜입니다. 사진 촬영일과 같은 칸에 두지 않습니다.','절임배추면 절인 날짜와 생배추 수확일을 나눕니다.']],
      ['도정일',['도정일은 양곡 표시의 도정연월일입니다. 생산연도와 한 칸에 넣지 않습니다.','당일도정 문구로 도정일을 대신하지 않습니다.']]
    ],
    faq:[['절임 도착일을 수확일로 읽어도 되나요?','도착일은 배송 일정입니다. 수확일이 아닙니다.'],['도정일만 있으면 생산연도는 생략하나요?','양곡 표시는 생산연도와 도정연월일을 나눕니다.']],
    sources:[['국립농산물품질관리원 양곡 표시','https://www.naqs.go.kr/hp/contents/contents.do?menuId=MN30613'],['농산물 표준규격제도','https://www.naqs.go.kr/hp/contents/contentsTab.do?menuId=MN30614']],
    related:[['수확일·실중량·품종 칸이 뜻하는 것','listing-field-terms'],['방문수령·산지직송·계근 시점','meetup-parcel-terms'],['우리 동네·산지·발송지를 구분하는 말','region-listing-terms']],
    boribay:'https://boribay.com/guides/kimjang-rice-listing-dates?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=c2c_howto_202609&utm_content=listing-date-terms',
    boribayText:'출하일·도정일을 칸에 적어 시즌 글 올리기',
    boribayDescription:'날짜 칸의 뜻을 나눴다면 시즌 판매글에 그 날짜를 적으세요.'
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
  const sourcesHtml=(page.sourceChecked?`<p>자료 확인일 ${escapeHtml(page.sourceChecked)} · 적용 범위와 개정 여부는 원문에서 다시 확인하세요.</p>`:'')+page.sources.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ${icon('external-link')}</a>`).join('');
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:page.title,description:page.description,datePublished:page.published||'2026-08-09',dateModified:page.modified||'2026-08-10',inLanguage:'ko-KR',mainEntityOfPage:canonical,author:{'@type':'Organization',name:'요미위키 편집팀'},publisher:{'@type':'Organization',name:'요미위키',url:'https://yomiwiki.com/'}}).replace(/</g,'\\u003c');
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(page.title)} | 요미위키</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(page.title)} | 요미위키"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><link rel="stylesheet" href="/knowledge.css?v=3.0.0"><script type="application/ld+json">${schema}</script></head><body><header class="site-header"><div class="header-inner"><a class="brand" href="/"><span class="brand-mark">${icon('sprout')}</span><strong>요미위키</strong></a><nav class="top-nav"><a href="/knowledge/produce-items">${icon('wheat')}품목</a><a href="/knowledge/produce-grading">${icon('notebook-tabs')}등급·선별</a><a href="/knowledge/storage-shipping">${icon('warehouse')}보관·출하</a><a href="/knowledge/farm-machinery">${icon('tractor')}농기계</a><a href="/knowledge/trade-terms">${icon('book-open')}거래용어</a></nav></div></header><main><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a>${icon('chevron-right')}<span>${escapeHtml(page.category)}</span></nav><article><header class="article-head"><p class="article-kicker">${icon('book-check')}${escapeHtml(page.category)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><div class="article-meta"><span>${icon('calendar-days')}수정일 ${escapeHtml(page.modified||'2026-08-10')}</span><span>${icon('refresh-cw')}공식 자료 확인</span><span>${icon('shield-check')}광고와 편집 분리</span></div></header><div class="article-grid"><div><section class="lead-box"><strong>먼저 알아두세요</strong><p>${escapeHtml(page.lead)}</p></section>${sectionHtml}${faqHtml}<section class="source-box"><h2>확인한 공식 자료</h2>${sourcesHtml}<p>공식 기준은 개정될 수 있습니다. 실제 거래·사용 전 최신 원문과 지역 담당기관 안내를 다시 확인하세요.</p></section></div><aside class="rail"><section><h2>관련 문서</h2><nav>${relatedHtml}</nav></section><section class="boribay-box"><h2>거래 준비로 이어가기</h2><p>${escapeHtml(page.boribayDescription||'기준을 확인했다면 같은 조건의 시세와 직거래 확인 순서를 이어서 보세요.')}</p><a href="${escapeHtml(page.boribay)}">${escapeHtml(page.boribayText)} ${icon('arrow-right')}</a></section></aside></div></article></main><footer class="site-footer"><div><span>© 2026 요미위키 · 농산물·농기계 거래 지식사전</span><nav><a href="/mn/" lang="mn">Монгол</a><a href="/about">소개</a><a href="/editorial-policy">편집 원칙</a><a href="/privacy">개인정보</a><a href="/contact">문의</a></nav></div></footer><script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script><script>if(window.lucide)lucide.createIcons();document.querySelectorAll('a[href*="boribay.com"]').forEach(a=>a.addEventListener('click',()=>window.gtag&&gtag('event','owned_referral_click',{source_domain:'yomiwiki.com',destination:a.href})));</script></body></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8','Cache-Control':'public,max-age=0,must-revalidate'}});
}
