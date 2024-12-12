let link = new URL(window.location.href);
const lang = link.searchParams.get('lang');
const word = link.searchParams.get('word');
let langs;
let langA;
let words = [];
let roles = [];
let filtered = [];

const root = document.querySelector(':root');
const setting = document.querySelector('#setting');
const filter = document.querySelector('#filter');
const filter_modal = document.querySelector('#filter-modal');
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
          list.innerHTML += `<div><a href="?lang=${l[0]}">${l[1]}</a></div>`;
      });
  }
  else{
	  langA = langs.find(l => l[0]==lang);
    title.style.display = 'block';
	  input.style.display = 'block';
	  title.innerHTML = `<b>${langA[1]}</b> <span>사전</span>`;
	  filtered = words = await getWords();
    roles = words.shift();
    if(word){
		input.value = word;
      search(word);
    }
    setting.onclick = () => setting.classList.toggle('expanded');
	  filter.onclick = () => filter.classList.toggle('expanded');
    theme.onclick = () => {theme.classList.toggle('darkened');root.classList.toggle('dark');}
	  input.oninput = () => search(input.value);
	  setFilterModal();
  }
}

// 검색 결과 출력
function search(target){
	link.searchParams.set('word', target);
	history.pushState({}, '', link);
	
	result.innerHTML = '';
  	t = target;
	if(t.length > 0){
	    const results = filtered.filter(row => row[roles.indexOf('단어')].includes(t) || row[roles.indexOf('뜻')].includes(t) || (roles.includes('보조 표기') && row?.[roles.indexOf('보조 표기')].includes(t)));
      	let num = roles.indexOf('단어');
		for(const n of [roles.indexOf('단어'), roles.indexOf('뜻'), roles.indexOf('보조 표기')]){
			if(n && results[0]?.[n].includes(t)){
				num = n;
				break;
			}
		}
      	results.sort((a, b) => getSort(a, b, num));
		results.slice(0,20).forEach(w => {
			result.innerHTML += w[roles.indexOf('분류')] ? `<div class="category" data="${w[roles.indexOf('분류')]}"> </div>` : ``;
	        result.innerHTML += `<h2>${w[roles.indexOf('단어')]}</h2>`;
			result.innerHTML += w[roles.indexOf('보조 표기')] ? `<h3>${w[roles.indexOf('보조 표기')]}</h3>` : ``;
			result.innerHTML += w[roles.indexOf('어원')] ? `<div class="etymology" data="${w[roles.indexOf('어원')]}"> </div>` : ``;
	        result.innerHTML += `<div><span>${w[roles.indexOf('품사')]}</span><span>${w[roles.indexOf('뜻')]}</span></div>`;
			result.innerHTML += w[roles.indexOf('설명')] ? `<div class="description">${w[roles.indexOf('설명')]}</div>` : ``;
			result.innerHTML += `<div class="margin"></div>`;
	    });
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
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:C?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

// words 배열을 가져옴
async function getWords(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${langA[2]}/values/${langA[0]}!A:I?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

// 배열
function getSort(a, b, num){
  if(roles[num] == '뜻'){
    if (a[num].split(', ').some(el => el.startsWith(t)) != b[num].split(', ').some(el => el.startsWith(t))){
  		return a[num].split(', ').some(el => el.startsWith(t)) ? -1 : 1;
  	}
  }
  else{
  	if (a[num].startsWith(t) != b[num].startsWith(t)){
  		return a[num].startsWith(t) ? -1 : 1;
  	}
	}
  return 1;
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
  
}

// 필터링
function setFilter(s, num){
  s_arr = s.split(':');
  
  if(s_arr[0] == '품사'){
    if(num){
      filtered = words.filter(row => row[4] == s_arr[1] || filtered.includes(row));
    }
    else{
      filtered = words.filter(row => row[4] != s_arr[1] && filtered.includes(row));
    }
  }
  else{
    if(num){
      filtered = words.filter(row => (row[8] && row[8].split(', ').includes(s)) || filtered.includes(row));
    }
    else{
      filtered = words.filter(row => (!row[8] || !row[8].split(', ').includes(s)) && filtered.includes(row));
    }
  }
  console.log(filtered)
  filtered = filtered.length == 0 ? words : filtered;
}

start();
