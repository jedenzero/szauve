let link = new URL(window.location.href);
const lang = link.searchParams.get('lang');
const word = link.searchParams.get('word');
let langs;
let langA;
let words = [];
let roles = [];
let filterParts = {};
let filterCats = {};
let filtered = [];
let orderLetters = [];
let orderParts = [];
let parts = {};

const root = document.querySelector(':root');
const setting = document.querySelector('#setting');
const filter = document.querySelector('#filter');
const filter_modal = document.querySelector('#filter-modal');
const stats = document.querySelector('#stats');
const stats_modal = document.querySelector('#stats-modal');
const theme = document.querySelector('#theme');
const list = document.querySelector('#list');
const title = document.querySelector('#title');
const input = document.querySelector('#input');
const result = document.querySelector('#result');

let t = '';

async function start(){
  langs = await getLangs();                                       
  if(!lang){
    setting.style.display = 'none';
    filter.style.display = 'none';
    filter_modal.style.display = 'none';
    theme.style.display = 'none';
  // 언어 목록 출력
      langs.forEach(l => {
          list.innerHTML += `<div><a href="?lang=${l[0]}">${l[2]}</a></div>`;
      });
  }
  else{
	  langA = langs.find(l => l[0]==lang);
    title.style.display = 'block';
	  input.style.display = 'block';
	  title.innerHTML = `<b>${langA[2]}</b> <span>사전</span>`;
	  words = await getWords();
    roles = words.shift();
    if(!roles.includes('뜻')){
      wordsTemp = [];
      rolesAll = ['분류','중요도', '등급', '단어', '보조 표기', '어원', '품사', '뜻', '예문', '설명', '비고']
      rolesParts = roles.filter(el=>!rolesAll.includes(el) && !/예문|번역문/.test(el));
      rolesNotParts = roles.filter(el=>!rolesParts.includes(el));
      orderParts = rolesParts.slice();
      rolesExamples = roles.filter(role=>/예문|번역문/.test(role));
      words.forEach(row=>{
        rowNotParts = row.filter((el,index)=>!rolesParts.includes(roles[index]));
        row.forEach((el,index)=>{
          if(el&&rolesParts.includes(roles[index])){
            wordsTemp.push([...rowNotParts,...new Array(roles.length-rolesParts.length-rowNotParts.length),el,roles[index]]);
          }
        });
      });
      roles = [...rolesNotParts,'뜻','품사'];
      words = wordsTemp;
    }
    if(!roles.includes('ID')){
      words = words.map((row,index)=>[...row,index+1]);
      roles.push('ID');
    }
    filtered = words.slice();
    if(word){
		input.value = word;
      search(word);
    }
    setting.onclick = () => setting.classList.toggle('expanded');
	  filter.onclick = () => filter.classList.toggle('expanded');
    stats.onclick = () => stats.classList.toggle('expanded');
    theme.onclick = () => {theme.classList.toggle('darkened');root.classList.toggle('dark');}
	  input.oninput = () => search(input.value);
	  setFilterModal();
    setStatsModal();
  }
}

// 검색 결과 출력
function search(target){
	link.searchParams.set('word', target);
	history.pushState({}, '', link);
	
	result.innerHTML = '';
  	t = target;
	if(t.length > 0){
	    const results = filtered.filter(row => row[roles.indexOf('단어')].includes(t) || row[roles.indexOf('뜻')].replace(/ ¶[^;]+(?=;|$)/g, '').includes(t) || (roles.includes('보조 표기') && row?.[roles.indexOf('보조 표기')].includes(t)));
      	let num = roles.indexOf('단어');
		for(const n of [roles.indexOf('단어'), roles.indexOf('뜻'), roles.indexOf('보조 표기')]){
			if(n > 0 && results[0]?.[n].includes(t)){
				num = n;
				break;
			}
		}
      	results.sort((a, b) => getSort(a, b, num));
		for(const [index,w] of results.slice(0,20).entries()){
      result.innerHTML += w[roles.indexOf('분류')] ? `<div class="category" data="${w[roles.indexOf('분류')]}"> </div>` : ``;
      result.innerHTML += w[roles.indexOf('중요도')] ? `<div class="importance">${'★'.repeat(w[roles.indexOf('중요도')])}</div>` : ``;
      result.innerHTML += w[roles.indexOf('등급')] ? `<div class="importance">${'★'.repeat(w[roles.indexOf('등급')])}</div>` : ``;
      result.innerHTML += `<h2>${w[roles.indexOf('단어')]}</h2>`;
      result.innerHTML += w[roles.indexOf('보조 표기')] ? `<h3>${w[roles.indexOf('보조 표기')]}</h3>` : ``;
      result.innerHTML += w[roles.indexOf('어원')] ? `<div class="etymology" data="${w[roles.indexOf('어원')]}"> </div>` : ``;
      result.innerHTML += w[roles.indexOf('품사')] ? `<span class="part">${w[roles.indexOf('품사')]}</span>` : ``;
      if(w[roles.indexOf('뜻')].includes('; ')){
        w[roles.indexOf('뜻')].split('; ').forEach((el,index)=>{
          result.innerHTML += `<div>${index+1}. ${el.split(' ¶')[0]}</div>`;
          if(el.includes(' ¶')){
            el.split(' ¶').slice(1).forEach(ex=>{
              result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
            });
          }
        });
      }
      else{
        result.innerHTML += `<span>${w[roles.indexOf('뜻')].split(' ¶')[0]}</span>`;
        if(w[roles.indexOf('뜻')].includes(' ¶')){
          w[roles.indexOf('뜻')].split(' ¶').slice(1).forEach(ex=>{
            result.innerHTML += `<blockquote>${ex.split('  ')[0]}<br>${ex.split('  ')[1]}</blockquote>`;
          });
      }
      }
      roles.filter(el=>el.includes('예문')).forEach(el=>{
        result.innerHTML += w[roles.indexOf(el)] ? `<blockquote>${w[roles.indexOf(el)]}<br>${w[roles.indexOf(el.replace('예문', '번역문'))]}</blockquote>` : ``;
      });
			result.innerHTML += w[roles.indexOf('설명')] ? `<div class="description">${w[roles.indexOf('설명')]}</div>` : ``;
			result.innerHTML += w[roles.indexOf('비고')] ? `<div class="description">${w[roles.indexOf('비고')]}</div>` : ``;
      result.innerHTML += `<div class="margin"></div>`;
	    }
		document.querySelectorAll('.category').forEach(e => {
	        e.innerHTML = getCategory(e.getAttribute('data'));
	    });
		document.querySelectorAll('.etymology').forEach(e => {
	        e.innerHTML = `<span class="etymology-marker">&lt;</span> <span>${getEtymology(e.getAttribute('data'))}</span>`;
	    });
	}
}

// langs 배열을 가져옴
async function getLangs(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

// words 배열을 가져옴
async function getWords(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${langA[3]}/values/${langA[1]||langA[0]}?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

// 배열
function getSort(a, b, num){
  if(roles[num] == '뜻'){
    if(a[num].split(/, |; /).some(el => el.split(' ¶')[0].match(/^${t}\s?\(/) || el.split(' ¶')[0].match(/\)\s?${t}$/) || el.split(' ¶')[0] == t)){
      return -1;
    }
    if(b[num].split(/, |; /).some(el => el.split(' ¶')[0].match(/^${t}\s?\(/) || el.split(' ¶')[0].match(/\)\s?${t}$/) || el.split(' ¶')[0] == t)){
      return 1;
    }
    if (a[num].split(/, |; /).some(el => el.startsWith(t)) != b[num].split(/, |; /).some(el => el.startsWith(t))){
  		return a[num].split(/, |; /).some(el => el.startsWith(t)) ? -1 : 1;
  	}
  }
  else{
  	if (a[num].startsWith(t) != b[num].startsWith(t)){
  		return a[num].startsWith(t) ? -1 : 1;
    }
  }
  if(roles[num] == '단어'){
    return 1;
  }
  else{
    return a[num].localeCompare(b[num]);
  }
}

// 분류의 HTML 코드
function getCategory(s){
	let result = '';
	s.split(', ').forEach(el => {
		result += `<div class="category-item">${el.split(':')[1]}</div>`;
	});
	return result;
}

// 어원의 HTML 코드
function getEtymology(s){
	let result = '';
	s.split(', ').forEach(id => {
		result += Number(id) ? words.find(w => w[roles.indexOf('ID')] == id)[roles.indexOf('단어')] : id;
		result += ' + ';
	});
	return result.slice(0, -3);
}

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
function setFilter(s){
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
}

start();
