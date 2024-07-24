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
        // 특수문자 추리기
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
        // 단어 수
        document.querySelector('#words').innerHTML=`<div style="font-size:0.8rem;">단어</div>
        <div style="text-align:center;">
        <span style="font-size:1.5rem;font-weight:bold;">${words.length}</span><span style="font-size:0.8rem;">개</span>
        </div>`;
        // 가장 긴 단어
        var long='';
        for(const row of words){
            if(row[1].length>long.length){
                long=row[1];
            }
        }
        document.querySelector('#long').innerHTML=`<div>가장 긴 단어</div><div style="font-weight:bold;">${long}</div>`;
    }
    else{
        
    }
}

async function getByCode(code){
    for(const row of codes){
        if(row[1]===code){
            if(row[4]){
                colors=row[4].split(', ');
                document.documentElement.style.setProperty('--background-color', colors[0]);
                document.documentElement.style.setProperty('--normal-color', colors[1]);
                document.documentElement.style.setProperty('--special-color', colors[2]);
            }
            document.querySelector('#welcome').innerHTML=`<span style="font-size:2rem;font-weight:bold;">${row[3]}</span><div><b>${row[2]}</b> 사전입니다.</div>`;
            const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:I?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data=await response.json();
            return data.values;
        }
    }
}

function inputSpecial(letter){
    document.querySelector('input').value+=letter.textContent;
    document.querySelector('input').focus();
    search();
}

function search(){
    document.querySelector('#output').innerHTML='';
    const target=document.querySelector('input').value;
    if(target===''){
        document.querySelector('#c1').style.display='grid';
        document.querySelector('#c2').style.display='grid';
        document.querySelector('#output').style.display='none';
    }
    else{
        document.querySelector('#c1').style.display='none';
        document.querySelector('#c2').style.display='none';
        document.querySelector('#output').style.display='block';
        
        const startsWithTarget = words.filter(row =>
              row[1].startsWith(target) || (row[2] && row[2].split(', ').some(el=>el.split(':')[1].startsWith(target))) || row[3].startsWith(target)
        );
        
        const containsTarget = words.filter(row =>
          !startsWithTarget.includes(row) && (row[1].includes(target) || (row[2] && row[2].split(', ').some(el=>el.split(':')[1].includes(target))) || row[3].includes(target))
        );
        
        const targets = [...startsWithTarget, ...containsTarget];
        
        targets.forEach(row=>{
            show(row);
        });
    }
}

function show(word){
    let output=`<div><sup>${word[0]}</sup><span>${word[1]}</span></div>
    <div>${word[3]}</div>`;
    if(word[2]){
        word[2].split(', ').forEach(el=>{
           output+=`<div><b>${el.split(':')[0]}</b><span>${el.split(':')[1]}</span></div>`; 
        });
    }
    if(word[6]){
        properties=word[6].split(', ');
        for(let i=0;i<properties.length;i++){
            output+=`<div><b>${properties[i].split(':')[0]}</b><span>${properties[i].split(':')[1]}</span></div>`;
        }
    }
    if(word[8]){
        output+=`<div class="info">${word[8]}</div>`;
    }
    if(word[7]){
        output+=`<div><b>어원</b>`;
        origin=word[7].split(', ');
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
