let link = new URL(window.location.href);
const lang = link.searchParams.get('lang');
const word = link.searchParams.get('word');

const partNames = [
  '명사','대명사','수사',
  '동사','형용사',
	'관형사','부사',
	'전치사','후치사','조사',
	'접속사','감탄사',
	'접두사','접미사','접요사','접환사',
	'기타'
];

let langs;
let infos;

let words = [];
let roles = [];
let parts = [];
let inflections = [];

let ior = {}; //Index Of the Role

let filterParts = {};
let filtered = [];

const root = document.querySelector(':root');
const setting = document.getElementById('setting');
const filter = document.getElementById('filter');
const filter_modal = document.getElementById('filter-modal');
const stats = document.getElementById('stats');
const stats_modal = document.getElementById('stats-modal');
const theme = document.getElementById('theme');
const list = document.getElementById('list');
const title = document.getElementById('title');
const input = document.getElementById('input');
const result = document.getElementById('result');

let t = ''; //target

async function start(){
  langs = await getLangs();
	
	if(!lang){
		title.innerHTML = `언어 선택`;
    setting.style.display = 'none';
    filter.style.display = 'none';
    filter_modal.style.display = 'none';
    stats.style.display = 'none';
    theme.style.display = 'none';
		input.placeholder = '찾고 싶은 언어를 입력하세요';
		input.oninput = () => searchLang(input.value);
		
		searchLang('');
  }
  else{
		infos = langs.find(l => l[0]==lang);
		
		if(infos[3]){
      document.documentElement.style.setProperty('--point', infos[3]);
    }

		title.innerHTML = `<b>${infos[2]}</b> <span>사전</span>`;
		setting.onclick = () => setting.classList.toggle('expanded');
	  filter.onclick = () => filter.classList.toggle('expanded');
    stats.onclick = () => stats.classList.toggle('expanded');
    theme.onclick = () => {theme.classList.toggle('darkened');root.classList.toggle('dark');};
		
		words = await getWords();
		
    roles = words.shift();
		
		if(roles.includes('뜻')){
      input.oninput = () => {t = input.value;beforeSearch();if(t.length > 0){searchI();}};
    }
		else{
			input.oninput = () => {t = input.value;beforeSearch();if(t.length > 0){searchS();}};
		}
		
    roles.forEach((el,index)=>{
					let role = el;
					
					role = role == '비고' ? '설명' : role;
					
			ior[role] = index;
			if(partNames.includes(role)){
				parts.push(role);
			}
    });
		
    filtered = words.slice();
		
    if(word){
	input.value = word;
      searchS(word);
    }
		
	  setFilterModal();
    setStatsModal();
  }
}

// langs 배열을 가져옴
async function getLangs(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:E?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

// words 배열을 가져옴
async function getWords(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${infos[4]}/values/${infos[1]||infos[0]}?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

function beforeSearch(){
	link.searchParams.set('word', t);
  history.pushState({}, '', link);
	result.innerHTML = '';
}

// 검색 결과 출력
// 일단 보류. 대규모 개편 필요.
/*function searchI(){
	const results = filtered.filter(row => row[ior['단어']].includes(t) || row[ior['뜻']].replace(/ ¶[^;]+(?=;|$)/g, '').includes(t) || (roles.includes('보조 표기') && row?.[ior['보조 표기']]?.includes(t)));
	let num = ior['단어'];
	for(const n of [ior['단어'], ior['뜻'], ior['보조 표기']]){
		if(n >= 0 && results[0]?.[n].includes(t)){
			num = n;
			break;
		}
	}
	results.sort((a, b) => getSort(a, b, num));
	let ids = [];
	for(const wort of results){
		if(!ids.includes(wort[ior['단어']])){
			ids.push(wort[ior['단어']]);
			words.forEach((w,index)=>{
				if(index==0){
					result.innerHTML += w[ior['분류']] ? `<div class="category" data="${w[ior['분류']]}"> </div>` : ``;
					result.innerHTML += w[ior['중요도']] ? `<div class="importance">${'★'.repeat(w[ior['중요도']])}</div>` : ``;
					result.innerHTML += w[ior['등급']] ? `<div class="importance">${'★'.repeat(w[ior['등급']])}</div>` : ``;
					result.innerHTML += `<h2>${w[ior['단어']]}</h2>`;
					result.innerHTML += w[ior['보조 표기']] ? `<h3>${w[ior['보조 표기']]}</h3>` : ``;
					result.innerHTML += w[ior['어원']] ? `<div class="etymology">${w[ior['어원']]}</div>` : ``;
				}
				result.innerHTML += w[ior['품사']] ? `<span class="part">${w[ior['품사']]}</span>` : ``;
				if(w[ior['뜻']].includes('; ')){
					w[ior['뜻']].split('; ').forEach((el,index)=>{
						result.innerHTML += `<div>${index+1}. ${el.split(' ¶')[0]}</div>`;
						if(el.includes(' ¶')){
							el.split(' ¶').slice(1).forEach(ex=>{
								result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
							});
						}
					});
				}
				else{
					result.innerHTML += `<span>${w[ior['뜻']].split(' ¶')[0]}</span>`;
					if(w[ior['뜻']].includes(' ¶')){
						w[ior['뜻']].split(' ¶').slice(1).forEach(ex=>{
							result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
						});
					}
				}
				roles.filter(el=>el.includes('예문')).forEach(el=>{
					result.innerHTML += w[ior[el]] ? `<blockquote>${w[ior[el]]}<br>${w[ior[el.replace('예문', '번역문')]]}</blockquote>` : ``;
				});
				if(index==synonyms.length-1){
					result.innerHTML += w[ior['설명']] ? `<div class="description">${w[ior['설명']]}</div>` : ``;
					result.innerHTML += w[ior['비고']] ? `<div class="description">${w[ior['비고']]}</div>` : ``;
					result.innerHTML += `<div class="margin"></div>`;
				}
				else{
					result.innerHTML += `<div class="margin-small"></div>`;
				}
			});
		}
		if(ids.length == 20){
			break;
		}
	}
	document.querySelectorAll('.category').forEach(e => {
		e.innerHTML = getCategory(e.getAttribute('data'));
	});
	document.querySelectorAll('.etymology').forEach(e => {
		e.innerHTML = `<span class="etymology-marker">&lt;</span> <span>${getEtymology(e.getAttribute('data'))}</span>`;
	});
}*/

function searchS(){
	let resultedWords;
	if(filtered.some(w => w[ior['단어']].includes(t))){
		const resultedWords1 = filtered.filter(w => w[ior['단어']].startsWith(t)).sort((a,b) => a[ior['단어']].length - b[ior['단어']].length);
		const resultedWords2 = filtered.filter(w => w[ior['단어']].includes(t) && !resultedWords1.includes(w)).sort((a,b) => a[ior['단어']].length - b[ior['단어']].length);
		resultedWords = [...resultedWords1, ...resultedWords2];
	}
	else{
		const resultedWords1 = filtered.filter(w => parts.some(part => w[ior[part]] && getAOM(w[ior[part]]).some(m => m == t)));
		const resultedWords2 = filtered.filter(w => parts.some(part => w[ior[part]] && getAOM(w[ior[part]]).some(m => m.startsWith(t)) && !resultedWords1.includes(w)));
		const resultedWords3 = filtered.filter(w => parts.some(part => w[ior[part]] && getAOM(w[ior[part]]).some(m => m.endsWith(t)) && !resultedWords1.includes(w) && !resultedWords2.includes(w)));
		const resultedWords4 = filtered.filter(w => parts.some(part => w[ior[part]] && getAOM(w[ior[part]]).some(m => m.includes(t)) && !resultedWords1.includes(w) && !resultedWords2.includes(w) && !resultedWords3.includes(w)));
		resultedWords = [...resultedWords1, ...resultedWords2, ...resultedWords3, ...resultedWords4];
	}
	
	resultedWords.slice(0,20).forEach(w => {
		result.innerHTML += `<h2>${w[ior['단어']]}</h2>`;
		result.innerHTML += w[ior['어원']] ? `<div><span class="etymology-marker">&lt;</span> <span class="etymology">${w[ior['어원']]}</span></div>` : ``;
		parts.forEach(part => {
			if(w[ior[part]]){
				if(w[ior[part]].includes('; ')){
					result.innerHTML += `<span class="part">${part}</span>`;
					w[ior[part]].split(';').forEach((m, i) => {
						result.innerHTML += `<div>${i+1}. ${m.split(' ¶')[0]}</div>`;
						if(m.includes(' ¶')){
							m.split(' ¶').slice(1).forEach(ex=>{
								result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
							});
						}
					});
				}
				else{
					result.innerHTML += `<div><span class="part">${part}</span><span>${w[ior[part]].split(' ¶')[0]}</span></div>`;
					if(w[ior[part]].includes(' ¶')){
						w[ior[part]].split(' ¶').slice(1).forEach(ex=>{
							result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
					});
					}
				}
			}
		});
		
		result.innerHTML += w[ior['설명']] ? `<div class="description">${w[ior['설명']]}</div>` : ``;
		
		//임시 2호기의 처리를 위한 임시 조치
		if(lang == 'im' && (w[ior['동사']] || w[ior['형용사']])){
			const stem = w[ior['단어']].slice(0,-2);
			result.innerHTML += `<details><summary><b>활용 표</b></summary><table>
			<tr>
				<th rowspan="2"></th><th colspan='3'>긍정</th><th colspan='3'>부정</th>
			</tr>
			<tr>
	 			<th>현재</th><th>과거</th><th>미래</th><th>현재</th><th>과거</th><th>미래</th>
			</tr>
			<tr>
				<th>직설법</th><td>${stem}ka</td><td>${stem}po</td><td>${stem}ho</td><td>${stem}yoka</td><td>${stem}yopo</td><td>${stem}yoho</td>
			</tr>
			<tr>
				<th>의문형</th><td>${stem}kaje</td><td>${stem}poje</td><td>${stem}hoje</td><td>${stem}yokaje</td><td>${stem}yopoje</td><td>${stem}yohoje</td>
			</tr>
			<tr>
				<th>명사형</th><td>${stem}kan</td><td>${stem}pon</td><td>${stem}hon</td><td>${stem}yokan</td><td>${stem}yopon</td><td>${stem}yohon</td>
			</tr>
			<tr>
				<th>관형형</th><td>${stem}kani</td><td>${stem}poni</td><td>${stem}honi</td><td>${stem}yokani</td><td>${stem}yoponi</td><td>${stem}yohoni</td>
			</tr>
			<tr>
				<th>접속형</th><td>${stem}kaja</td><td>${stem}poja</td><td>${stem}hoja</td><td>${stem}yokaja</td><td>${stem}yopoja</td><td>${stem}yohoja</td>
			</tr>
			<tr>
				<th>명령형</th><td colspan='3'>${stem}pya</td><td colspan='3'></td>
			</tr>
			<tr>
				<th>금지형</th><td colspan='3'>${stem}ko</td><td colspan='3'></td>
			</tr>
			<tr>
				<th>청유형</th><td colspan='3'>${stem}ha</td><td colspan='3'>${stem}yoha</td>
			</tr>
			</table></details>`;
		}
		result.innerHTML += `<div class="margin"></div>`;
	});
}

//get Array of Meaning
function getAOM(m){
	return m.includes(','||';') ? m.split(', '||'; ').map(el => el.replace(/¶.+|\[[^\[\]]+\]\s?|\([^\(\)]+\)\s?/g, '')) : [m];
}

// 분류의 HTML 코드
/*function getCategory(s){
	let result = '';
	s.split(', ').forEach(el => {
		result += `<div class="category-item">${el.split(':')[1]}</div>`;
	});
	return result;
}*/

function setFilterModal(){
  if(roles.includes('품사')){
    words.forEach(row=>{
      const part = row[roles.indexOf('품사')];
      if(Object.keys(parts).includes(part)){
        parts[part]++;
      }
      else{
        parts[part] = 1;
      }
    });
    if(orderParts.length == 0){
      orderParts = Object.entries(parts).sort((a,b)=>{return b[1] - a[1]}).map(row=>row[0]);
    }
    orderParts.forEach(el=>{
      filter_modal.innerHTML += `<span class="category-item" onclick="this.classList.toggle('selected');setFilter('품사:${el}');">${el}</span>`;
      filterParts[el] = 0;
    });
  }
}

function setStatsModal(){
  stats_modal.innerHTML += `<div>총 단어 : ${words.length}개</div>`;
  if(roles.includes('품사')){
    orderParts.forEach(el=>{
      stats_modal.innerHTML += `<div>${el} : ${parts[el]}개(${Math.floor(parts[el]/words.length*1000)/10}%)</div>`;
    });
  }
}

// 필터링
/*function setFilter(s){
  const s_arr = s.split(':');
  if(s_arr[0] == '품사'){
    filterParts[s_arr[1]] = 1 - filterParts[s_arr[1]];
  }
  filtered = words.filter(row=>{
    if(Object.keys(filterParts).length > 0 && filterParts[row[roles.indexOf('품사')]] == 0){
      return false;
    }
    // 카테고리 별 필터링
    if(Object.keys(filterCats).length > 0){
      // return false;
    }
    return true;
  });
  if(filtered.length == 0){
    filtered = words.slice();
  }
  search(t);
}*/

function searchLang(target){
	list.innerHTML = '';
	langs.forEach(l => {
		if(l[0].toLowerCase().startsWith(target.toLowerCase()) || l[2].startsWith(target)){
			list.innerHTML += `<div><a href="?lang=${l[0]}"><span style="font-size:18px;">${l[2]}</span><span style="color:var(--weaker);"> (${l[0]})</span></a></div>`;
			list.innerHTML += `<div class="margin-small"></div>`;
		}
	});
}

start();
