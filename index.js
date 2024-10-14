const link = new URL(window.location.href);
const lang = link.searchParams.get('lang');
const word = link.searchParams.get('word');
let langs;
let words = [];
  
const list = document.querySelector('#list');
const input = document.querySelector('#input');
const result = document.querySelector('#result');

async function start(){
  langs = await getLangs();
                                       
  if(!lang){
      langs.forEach(l => {
          list.innerHTML += `<div><a href="?lang=${l[0]}">${l[1]}</a></div>`;
      });
  }
  else{
      input.display = 'block';
      words = await getWords();
      if(word){
				input.value = word;
        search(word);
      }
			input.oninput = () => search(input.value);
  }
}
function search(target){
    const results = words.filter(row => row[1].includes(target) || row[2].includes(target));
    results.sort((a, b) => getPoint(a, b, target));
    result.innerHTML = '';
		results.forEach(w => {
        result.innerHTML += `<div>
        <h2>${w[1]}</h2>
        <div>뜻 : ${w[2]}</div>
        </div>`;
    });
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

function getPoint(a, b, target){
    return a[1].startsWith(target) + a[2].startsWith(target) + (a[1].length > b[1].length) + (a[2].length > b[2].length) - 2;
}

start();
