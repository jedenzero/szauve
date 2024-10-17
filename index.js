const link = new URL(window.location.href);
const lang = link.searchParams.get('lang');
const word = link.searchParams.get('word');
let langs;
let words = [];
  
const list = document.querySelector('#list');
const input = document.querySelector('#input');
const result = document.querySelector('#result');

let t = '';

async function start(){
  langs = await getLangs();
                                       
  if(!lang){
      langs.forEach(l => {
          list.innerHTML += `<div><a href="?lang=${l[0]}">${l[1]}</a></div>`;
      });
  }
  else{
      input.style.display = 'block';
      words = await getWords();
      if(word){
		input.value = word;
        search(word);
      }
	  input.oninput = () => search(input.value);
  }
}

function search(target){
	result.innerHTML = '';
  	t = target;
	if(t.length > 0){
	    const results = words.filter(row => row[1].includes(t) || row[3].includes(t) || (row[6] && row[6].includes(t)));
      	let num = 1;
		for(const n of [1, 3, 6]){
			if(results[0]?.[n].includes(t)){
				num = n;
				break;
			}
		}
      	results.sort((a, b) => getSort(a, b, num));
		results.slice(0,20).forEach(w => {
	        result.innerHTML += `<h2>${w[1]}</h2>`;
			if(w[6]){
				result.innerHTML += `<h3>${w[6]}</h3>`;
			}
	        result.innerHTML += `<div>${w[3]}</div>`;
	    });
	}
}

async function getLangs(){
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:C?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

async function getWords(){
    const l = langs.find(l => l[0]==lang);
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${l[2]}/values/${l[0]}!A:H?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

function getSort(a, b, num){
	if (a[num].startsWith(t) != b[num].startsWith(t)){
		return a[num].startsWith(t) ? -1 : 1;
	}
	else{
		return a[num].localeCompare(b[num]);
	}
}

start();
