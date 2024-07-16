const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];
var specials = [];
var clicked = null;
var test = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]*$/;

async function fetchData(){
    const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:E?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data=await response.json();
    if(lang){
        codes=data.values;
        words=await getByCode(lang);
        for(const row of words){
            if(!test.test(row[1])){
                for(const el of row[1]){
                    if(!test.test(el)&&!specials.includes(el)){
                        specials.push(el);
                    }
                }
            }
        }
        specials.sort((a,b)=>a.localeCompare(b));
        specials.forEach(el=>{
            document.querySelector('#special').innerHTML+=`<div onclick="inputSpecial(this);">${el}</div>`
        });
    }
    else{
        
    }
}

async function getByCode(code){
    for(const row of codes){
        if(row[1]===code){
            if(row[4]){
                document.documentElement.style.setProperty('--background-color', row[4].split(', ')[0]);
                document.documentElement.style.setProperty('--normal-color', row[4].split(', ')[1]);
                document.documentElement.style.setProperty('--special-color', row[4].split(', ')[2]);
            }
            document.querySelector('#welcome').innerHTML=`<h1>${row[3]}</h1><b>${row[2]}</b> 사전입니다.`;
            const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:H?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
            const data=await response.json();
            return data.values;
        }
    }
}

function inputSpecial(letter){
    document.querySelector('input').value+=letter.textContent;
    document.querySelector('input').focus();
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
    let output=`<div><sup>${word[0]}</sup><span>${word[1]}</span></div>
    <div>${word[2]}</div>`;
    if(word[4]){
        property=word[4].split(', ');
        for(let i=0;i<property.length;i++){
            output+=`<div><b>${word[4].split(',')[i].split(':')[0]}</b><span>${word[4].split(',')[i].split(':')[1]}</span></div>`;
        }
    }
    if(word[7]){
        output+=`<div class="info">${word[7]}</div>`;
    }
    if(word[6]){
        output+=`<div><b>어원</b>`;
        origin=word[6].split(', ');
        for(let i=0;i<origin.length;i++){
            if(i!=0){
                output+=`<span>+</span>`;
            }
            output+=`<span>${words[words.findIndex(row=>row[0]===origin[i])][1]}</span>`;
        }
        output+=`</div>`;
    }
    
    const newWord=document.createElement('div');
    newWord.innerHTML=output;
    newWord.className='word';
    document.querySelector('#output').appendChild(newWord);
}

fetchData();
