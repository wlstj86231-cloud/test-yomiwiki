const knowledge = {
  '가락시장 시세 용어': {
    title:'가락시장 시세와 가격 계산 용어', subtitle:'경락가 · 단량 · 실중량 · 결제액 구분', article:'trade-terms',
    rows:[['book-open','가격 구분',['경락가·평균가격·판매자가 정한 직거래 가격은 서로 다른 정보입니다.','기준일·시장·품목·품종·등급·단위를 함께 읽습니다.']],['scale','중량 구분',['단량은 한 거래 단위에 들어 있는 양입니다.','kg당 가격 비교에는 포장재를 제외한 농산물 내용량을 사용합니다.']],['calculator','비용 구분',['상품금액과 배송비를 구분하고 배송비가 상자별인지 주문 전체인지 확인합니다.','구매자 결제액만으로 판매자 정산액이나 순이익을 알 수 없습니다.']]],
    related:['감자 특품 기준','농기계 거래 용어','영농폐기물 용어'],
    link:'https://boribay.com/guides/garak-market-price-lookup?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=auction_price_terms',linkText:'오늘 서울가락 kg당 가중평균 표 보기'
  },
  '농기계 거래 용어': {
    title:'농기계 판매·운송 용어', subtitle:'장비 정보 · 포함 범위 · 상하차 구분', article:'farm-machinery',
    rows:[['tractor','기계 정보',['모델명·제조번호·연식·사용시간을 서로 구분합니다.','작업기 포함이면 명칭·수량·연결 규격과 상태를 각각 확인합니다.']],['truck','운송 조건',['상차·운송·하차는 다른 작업입니다. 견적의 포함 범위를 확인합니다.','작업기를 붙인 전체 크기·중량과 자력 이동 가능 여부를 전달합니다.']],['clipboard-check','판매 설명',['현재 하자, 과거 수리, 아직 확인하지 못한 부분을 구분합니다.','시동 확인만으로 작업 부하 상태까지 검증했다고 적지 않습니다.']]],
    related:['중고 트랙터 사용시간','가락시장 시세 용어','영농폐기물 용어'],
    link:'https://boribay.com/guides/farm-machinery-transport-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=machinery_transport_terms',linkText:'농기계 탁송 견적 요청 항목 보기'
  },
  '영농폐기물 용어': {
    title:'영농폐기물 분류와 공동집하장 용어', subtitle:'품목 · 재질 · 내용물 · 지역 접수 여부', article:'farm-waste-terms',
    rows:[['recycle','품목 구분',['농사에 쓴 모든 자재가 같은 수거 대상은 아닙니다.','폐비닐·농약 빈 용기와 그 밖의 자재를 구분합니다.']],['package','내용물 확인',['빈 용기와 내용물이 남은 용기를 구분합니다.','재질·내용물을 모르겠으면 사진과 표시를 준비해 담당기관에 문의합니다.']],['map-pin','집하장 확인',['주소와 별개로 현재 받는 품목·이용 대상·반입 시점을 확인합니다.','수거보상금과 일반 중고상품 판매가격은 다릅니다.']]],
    related:['비료 사용 기준','농기계 거래 용어','가락시장 시세 용어'],
    link:'https://boribay.com/guides/farm-supplies-disposal-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=farm_waste_terms',linkText:'분류한 품목의 배출 안내·집하장 찾기'
  },
  '감자 특품 기준': {
    title:'감자 특품 기준', subtitle:'핵심 요약 · 현장 기준',
    rows:[
      ['award','등급 확인',['특품은 외관과 품질이 우수한 상위 거래 등급을 뜻합니다.','상품성·크기·형태·병해충·상처 유무를 함께 확인합니다.']],
      ['ruler','크기·상태',['크기 기준은 품종과 출하처 규격에 따라 달라 먼저 규격표를 확인합니다.','둥글고 균일하며 변형·기형이 적은지 봅니다.','표면의 상처·녹변·갈변·부패 여부를 확인합니다.']],
      ['warehouse','보관·출하',['직사광선을 피하고 통풍되는 서늘한 곳에 둡니다.','장기 보관 전 적정 온도·습도와 싹 억제 기준을 확인합니다.','출하 전 흙 제거와 포장 상태를 점검합니다.']],
      ['clipboard-check','거래 전 확인',['생산지·수확일·보관 기간·약제 사용 여부를 묻습니다.','샘플을 확인해 외관·크기·품질을 비교합니다.','운송 중 파손을 줄일 포장 상태와 책임 기준을 확인합니다.']]
    ],
    related:['감자 상·중·하 기준','감자 저장 온도와 습도','감자 수확 시기 판단','감자 품종별 특징','농산물 포장 규격'],
    link:'https://boribay.com/guides/new-potato-10kg-price-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=potato_grade',
    linkText:'감자 시세와 직거래 준비 보기'
  },
  '양파 저장 온도': {
    title:'양파 저장 전 확인 기준', subtitle:'건조 · 온도 · 통풍 순서',
    rows:[
      ['sun','예비 건조',['수확 직후 겉껍질과 목 부분을 충분히 말려 부패 위험을 낮춥니다.','비나 이슬에 젖은 양파는 바로 쌓지 않습니다.']],
      ['thermometer','저장 조건',['저장 방식과 기간에 따라 적정 온도와 습도가 달라집니다.','저온 저장고는 품온을 천천히 낮추고 결로가 생기지 않게 관리합니다.']],
      ['wind','통풍·적재',['망과 상자 사이 공기 길을 확보하고 벽에 바짝 붙이지 않습니다.','무른 구, 상처 난 구, 목이 굵은 구는 선별해 먼저 출하합니다.']],
      ['clipboard-check','거래 전 확인',['수확일·건조 기간·저장 방식·싹 발생 여부를 확인합니다.','중량뿐 아니라 부패·압상·발근 비율을 함께 확인합니다.']]
    ],
    related:['양파 선별 기준','양파 망 포장 규격','저온 저장고 결로','양파 수확 시기','농산물 감모 계산'],
    link:'https://boribay.com/?query=%EC%96%91%ED%8C%8C&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=onion_storage',
    linkText:'양파 지역 거래 준비 보기'
  },
  '중고 트랙터 사용시간': {
    title:'중고 트랙터 사용시간 확인', subtitle:'계기판보다 정비 이력과 마모를 함께 확인',
    rows:[
      ['gauge','계기판 확인',['시간계 숫자만으로 상태를 단정하지 않습니다.','계기판 교체 여부와 연식·소유 이력을 함께 확인합니다.']],
      ['wrench','정비 이력',['엔진오일·미션오일·필터·클러치·유압 계통 교체 기록을 봅니다.','작업 종류와 연간 사용시간을 판매자에게 확인합니다.']],
      ['tractor','실물 점검',['냉간 시동, 매연, 누유, PTO, 유압, 변속, 타이어 마모를 순서대로 봅니다.','명판의 제조번호와 등록·보증 관련 서류가 일치하는지 확인합니다.']],
      ['clipboard-check','거래 전 확인',['충분히 시운전하고 가능하면 농기계 정비사와 함께 점검합니다.','계약서에 모델·제조번호·부속기·하자 고지 내용을 적습니다.']]
    ],
    related:['트랙터 명판 읽는 법','PTO 작동 점검','유압 누유 확인','중고 농기계 계약서','트랙터 정비주기'],
    link:'https://boribay.com/guides/used-tractor-buying-checklist?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=tractor_hours',
    linkText:'중고 트랙터 매물 점검표 보기'
  },
  '트랙터 정비주기': null,
  '한우 출하 체중': null,
  '벼 건조 온도': null,
  '비료 사용 기준': null
};

knowledge['트랙터 정비주기']=knowledge['중고 트랙터 사용시간'];
knowledge['한우 출하 체중']={...knowledge['감자 특품 기준'],title:'한우 출하 판단 기준',subtitle:'체중만이 아닌 월령·육질·사양 상태 확인',rows:[['scale','체중 확인',['출하 체중은 성별·품종·사양 방식과 농가 목표에 따라 다릅니다.','최근 계근 기록과 증체 추이를 함께 확인합니다.']],['calendar-range','월령·사양',['월령과 사양 단계, 건강 상태, 사료 섭취 변화를 봅니다.','출하 시기는 도체 성적과 사료비를 함께 고려해 판단합니다.']],['badge-check','개체 정보',['이력번호와 귀표, 예방접종·질병 치료 기록을 확인합니다.','축산물이력제 정보와 실제 개체가 일치하는지 확인합니다.']],['clipboard-check','거래 전 확인',['계근 조건·운송 조건·정산 기준을 서면으로 확인합니다.','지역 축협·전문가의 최근 출하 자료와 비교합니다.']]],related:['한우 월령 확인','축산물이력제 조회','도체 등급 용어','가축 운송 확인','출하 정산 기준'],link:'https://boribay.com/?query=%ED%95%9C%EC%9A%B0&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=cattle_shipping',linkText:'한우 지역 거래 준비 보기'};
knowledge['벼 건조 온도']={...knowledge['감자 특품 기준'],title:'벼 건조 전 확인 기준',subtitle:'수분 · 품질 · 건조기 설정 확인',rows:[['droplets','수분 확인',['수확 직후 수분을 측정하고 품종·수확 상태를 기록합니다.','측정기 오차를 줄이도록 여러 지점에서 시료를 채취합니다.']],['thermometer','건조 설정',['용도와 건조기 방식에 맞는 온도·시간을 사용합니다.','고온 급건조는 동할과 품질 저하 위험이 있어 장비 설명서와 지도 기준을 따릅니다.']],['wind','냉각·저장',['건조 후 곡온을 충분히 낮춘 뒤 저장합니다.','저장 중 수분 이동·결로·해충 발생을 정기적으로 확인합니다.']],['clipboard-check','거래 전 확인',['품종·수확일·건조 방식·최종 수분을 거래 기록에 남깁니다.','공공 수매나 출하처의 당해 규격을 별도로 확인합니다.']]],related:['벼 수분 측정','곡물 건조기 점검','쌀 품질 용어','벼 저장 관리','공공비축 규격'],link:'https://boribay.com/guides/fresh-milled-rice-buying-guide?utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=rice_drying',linkText:'햅쌀 직거래 확인 기준 보기'};
knowledge['비료 사용 기준']={...knowledge['감자 특품 기준'],title:'비료 사용 전 확인 기준',subtitle:'작물 · 토양 · 제품 표시 순서',rows:[['sprout','작물 확인',['작물과 생육 단계에 맞는 비료인지 먼저 확인합니다.','관행량을 그대로 반복하지 말고 재배 지침과 토양 상태를 함께 봅니다.']],['flask-conical','토양·성분',['토양검정 결과와 질소·인산·칼리 성분량을 확인합니다.','같은 상표라도 성분과 권장량이 다를 수 있어 포장 표시를 읽습니다.']],['cloud-rain','살포 조건',['비가 오기 직전 과다 살포나 강풍 속 엽면 살포를 피합니다.','보호장비와 농기계 사용 설명을 지킵니다.']],['clipboard-check','기록·거래',['제품명·사용량·사용일·포장을 기록하고 남은 비료는 건조하게 보관합니다.','공식 농업기술센터 처방과 제품 표시사항을 우선합니다.']]],related:['토양검정 받는 법','비료 성분표 읽기','밑거름·웃거름','살포기 점검','농자재 거래 확인'],link:'https://boribay.com/?query=%EB%B9%84%EB%A3%8C&utm_source=yomiwiki.com&utm_medium=owned_referral&utm_campaign=knowledge_desk&utm_content=fertilizer',linkText:'농자재 지역 거래 준비 보기'};

const form=document.querySelector('#knowledge-search');
const input=document.querySelector('#search-input');
const rows=document.querySelector('#answer-rows');
const title=document.querySelector('#answer-title');
const subtitle=document.querySelector('#answer-subtitle');
const related=document.querySelector('#related-topics');
const contextLink=document.querySelector('#boribay-context-link');

function selectKnowledge(query){
  const normalized=(query||'').trim();
  let key=normalized?Object.keys(knowledge).find(k=>normalized.includes(k)||k.includes(normalized)):'감자 특품 기준';
  if(!key&&/폐기물|폐비닐|농약.*(병|용기|봉지)|집하장|폐농자재/.test(normalized))key='영농폐기물 용어';
  if(!key&&/가락|경락|시세|단량|실중량|kg당|가격.*계산/.test(normalized))key='가락시장 시세 용어';
  if(!key&&/운송|탁송|상차|하차|작업기|PTO|농기계.*판매/i.test(normalized))key='농기계 거래 용어';
  if(!key&&/트랙터|농기계|사용시간/.test(normalized))key='중고 트랙터 사용시간';
  if(!key&&/양파|저장/.test(normalized))key='양파 저장 온도';
  if(!key&&/한우|출하|체중/.test(normalized))key='한우 출하 체중';
  if(!key&&/벼|쌀|건조/.test(normalized))key='벼 건조 온도';
  if(!key&&/비료|토양/.test(normalized))key='비료 사용 기준';
  if(!key)key='감자 특품 기준';
  return {key,data:knowledge[key]};
}

function render(query,track=false){
  const {key,data}=selectKnowledge(query);
  title.textContent=`검색 결과: ${data.title}`;
  subtitle.textContent=data.subtitle;
  rows.innerHTML=data.rows.map(([icon,label,points])=>`<section class="answer-row"><div class="answer-label"><i data-lucide="${icon}" aria-hidden="true"></i><span>${label}</span></div><ul class="answer-points">${points.map(point=>`<li>${point}</li>`).join('')}</ul></section>`).join('');
  related.innerHTML=data.related.map(item=>`<button type="button" data-related="${item}">${item}</button>`).join('');
  contextLink.href=data.link;contextLink.innerHTML=`${data.linkText} <i data-lucide="arrow-right" aria-hidden="true"></i>`;
  const articleLink=document.querySelector('#knowledge-article-link');
  articleLink.hidden=!data.article;
  articleLink.innerHTML=data.article?`<a href="/knowledge/${data.article}">용어 설명·예시·공식 출처 전체 읽기</a>`:'';
  document.querySelectorAll('[data-query]').forEach(button=>button.classList.toggle('active',button.dataset.query===key));
  if(window.lucide)lucide.createIcons();
  if(track&&window.gtag)gtag('event','knowledge_search',{search_term:query,knowledge_result:key});
}

form.addEventListener('submit',event=>{event.preventDefault();const query=input.value.trim();render(query,true);history.replaceState({},'',query?`/?q=${encodeURIComponent(query)}`:'/');document.querySelector('.result-layout').scrollIntoView({behavior:'smooth',block:'start'})});
document.querySelectorAll('[data-query]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.query;render(button.dataset.query,true)}));
related.addEventListener('click',event=>{const button=event.target.closest('[data-related]');if(!button)return;input.value=button.dataset.related;render(button.dataset.related,true)});
document.querySelector('#menu-button').addEventListener('click',event=>{const nav=document.querySelector('.primary-nav');const open=nav.classList.toggle('open');event.currentTarget.setAttribute('aria-expanded',String(open))});
document.querySelector('#bookmark-page').addEventListener('click',()=>alert('브라우저의 즐겨찾기 기능(Ctrl+D)을 이용해 요미위키를 저장해 주세요.'));
document.querySelectorAll('a[href*="boribay.com"]').forEach(link=>link.addEventListener('click',()=>{if(window.gtag)gtag('event','owned_referral_click',{destination:link.href,source_domain:'yomiwiki.com'})}));

const initialQuery=new URLSearchParams(location.search).get('q')||'감자 특품 기준';
input.value=initialQuery==='감자 특품 기준'?'':initialQuery;
render(initialQuery);
if(window.lucide)lucide.createIcons();
