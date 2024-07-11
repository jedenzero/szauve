const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];
var clicked = null;

async function fetchData(){
    const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data=await response.json();
    if(lang){
        codes=data.values;
        words=await getByCode(lang);
    }
    else{
        
    }
}

async function getByCode(code){
    for(const row of codes){
        if(row[1]===code){
            document.querySelector('#welcome').innerHTML=`<h1>${row[3]}</h1><b>${row[2]}</b> 사전입니다.`;
            const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:H?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
            const data=await response.json();
            return data.values;
        }
    }
}

function search(){
    document.querySelector('#output').innerHTML='';
    const target=document.querySelector('input').value;
    var targets=[...words.filter(row=>row[1].startsWith(target)||row[2].startsWith(target)),...words.filter(row=>(!row[1].startsWith(target)&&row[1].includes(target))||(!row[2].startsWith(target)&&row[2].includes(target)))];
    targets.forEach(row=>{
        show(row);
    });
}

function show(word){
    let output=`<div><sup>${word[0]}</sup><span>${word[1]}</span>
    <div>${word[2]}</div>`;
    if(word[6]){
        output+=`<span>&lt;</span>`
        origin=word[6].split(', ');
        for(let i=0;i<origin.length;i++){
            if(i!=0){
                output+=`<span>+</span>`;
            }
            output+=`<span>${words[words.findIndex(row=>row[0]===origin[i])][1]}</span>`;
        }
    }
    output+=`</div><div>`;
    if(word[4]){
        property=word[4].split(', ');
        for(let i=0;i<property.length;i++){
            output+=`<b>${word[4].split(':')[0]}</b><span>${word[4].split(':')[1]}</span>`;
        }
    }
    output+=`</div><div>`;
    output+=`</div>`;
    
    const newWord=document.createElement('div');
    newWord.innerHTML=output;
    newWord.className='word';
    document.querySelector('#output').appendChild(newWord);

    newWord.addEventListener('click',function(){
        if(clicked){
            clicked.classList.remove('word-clicked');
        }
        if(clicked!==newWord){
            newWord.classList.add('word-clicked');
            clicked=newWord;
        }else{
            clicked=null;
        }
    });
}

fetchData();
