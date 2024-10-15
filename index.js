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
	    const results = words.filter(row => row[1].includes(t) || row[2].includes(t));
      const num = results[0][2].includes(t) + 1;
      results.sort((a, b) => getSort(a, b, num));
			results.forEach(w => {
	        result.innerHTML += `<div>
	        <h2>${w[1]}</h2>
	        <div>뜻 : ${w[2]}</div>
	        </div>`;
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
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${l[2]}/values/${l[0]}!A:C?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data = await response.json();
    return data.values;
}

function getSort(a, b, num){
  return a[num].startsWith(t) - b[num].startsWith(t) + a[num].localeCompare(b[num]) - 1 || a[num].localeCompare(b[num]) || a[num].length < b[num].length;
}

start();