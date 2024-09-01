const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];
var examples = [];
var rules = [];
var originWords = {};
var filtered = [];
var specials = [];
var clicked = null;
var test = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]*$/;

async function fetchData(){
    const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:E?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data=await response.json();
    codes=data.values;
    if(lang){
        await setData();
        setGrid();
    }
    else{
        document.querySelector('#input').style.display='none';
        document.querySelector('#default').style.display='none';
        codes.forEach(el=>{
            document.querySelector('#output').innerHTML+=`<a href="?lang=${el[1]}"><div class="box-31 default"><b>${el[2]}</b></div></a>`;
        });
    }
}

async function setData(){
    for(const row of codes){
        if(row[1]===lang){
            const response1=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:I?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data1=await response1.json();
            words=filtered=data1.values;
            const response2=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]+'-ex'}!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data2=await response2.json();
            examples=data2.values;
            const response3=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]+'-pr'}!A:B?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data3=await response3.json();
            rules=data3.values;
            const originLangs = {};
            for(const row of words){
                if(row[7]&&row[7].includes('(')){
                for(const el of row[7].split(', ')){
                    if(el.includes('(')){
                        const originWord = el.split('(')[0];
                        const originLang = el.split('(')[1].slice(0,-1);
                        if(codes.some(lang=>lang[1]==originLang)){
                            if(!originLangs[originLang]){
                                const response4=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${codes.find(lang=>lang[1]==originLang)[0]}/values/${originLang}!A:I?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
                                const data4=await response4.json();
                                originLangs[originLang]=data4.values;
                            }
                            originWords[el]=[originLangs[originLang].find(word=>word[0]==originWord)[1],codes.find(lang=>lang[1]==originLang)[2]];
                        }
                        else{
                            originWords[el]=[originWord,originLang];
                        }
                    }
                }
                }
            }
        }
    }
}

function setGrid(){
    // 환영인사
    for(const row of codes){
        if(row[1]===lang){
            if(row[4]){
                document.documentElement.style.setProperty('--theme', row[4]);
            }
            document.querySelector('#welcome').innerHTML=`<div class="title">${row[3]}</div><div><b>${row[2]}</b> 사전입니다.</div>`;
        }
    }
    // 단어 수
    document.querySelector('#words').innerHTML=`<div class="small">단어</div>
    <div class="center">
    <span class="title">${words.length}</span><span class="small">개</span>
    </div>`;
    var properties={품사:{}};
    var long=['',''];
    for(const row of words){
        //품사
        if(!Object.keys(properties['품사']).includes(row[4])){
            properties['품사'][row[4]]=1;
        }
        else{
            properties['품사'][row[4]]++;
        }
        // 가장 긴 단어
        if(row[1].length>long[1].length){
            long=row;
        }
        // 분류
        if(row[6]){
            for(const el of row[6].split(', ')){
                if(!Object.keys(properties).includes(el.split(':')[0])){
                    properties[el.split(':')[0]][el.split(':')[1]]=1;
                }
                else{
                    properties[el.split(':')[0]][el.split(':')[1]]++;
                }
            }
        }
    }
    // 품사
    document.querySelector('#parts').innerHTML=`<div class="small">품사</div>
    <div style="text-align:center;">
    <span class="title">${Object.keys(properties['품사']).length}</span><span class="small">개</span>
    </div>`;
    //가장 긴 단어
    document.querySelector('#long').innerHTML=`<div>
    <div class="title">${long[1]}</div>
    <div>${long[3].split(', ')[0]}</div>
    </div>`;
    // 무작위 단어
    var random=words[Math.floor(words.length*Math.random())];
    document.querySelector('#random').innerHTML=`<div>
    <div class="title">${random[1]}</div>
    <div>${random[3].split(', ')[0]}</div>
    </div>`;
    // 정렬
    for(const prop of Object.keys(properties)){
        prop = Object.entries(properties[prop])
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }
    // 그래프
    for(const prop of Object.keys(properties)){
        document.querySelector('#graph').innerHTML+=`<div class="${prop=='품사'?'box-11 default':'box-31 default'}"><canvas id="${prop}-graph"></canvas>`;
        const ctx = document.getElementById(`${prop}-graph`).getContext('2d');
        const chart = new Chart(ctx, {
          type: prop=='품사'?'doughnut':'line',
          data: {
            labels: Object.keys(parts),
            datasets: [{
              data: Object.values(properties[prop]).map(el=>el/words.length*100),
              backgroundColor: Array(Object.keys(properties[prop]).length).fill(getComputedStyle(document.documentElement).getPropertyValue('--gray-2').trim()),
              hoverBackgroundColor: Array(Object.keys(properties[prop]).length).fill(getComputedStyle(document.documentElement).getPropertyValue('--theme').trim()),
              borderColor: Array(Object.keys(properties[prop]).length).fill(getComputedStyle(document.documentElement).getPropertyValue('--gray-0').trim()),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function(tooltipItem) {
                    return `${Math.ceil(tooltipItem.raw*10)/10}%`;
                  }
                }
              }
            }
          }
        });
    }
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
        document.querySelector('#special-box').innerHTML+=`<div class="special-item" onclick="special(this);">${el}</div>`
    });
    // 필터
    document.querySelector('#filter').innerHTML+=`<div class="filter-title">품사</div>`;
    document.querySelector('#filter').innerHTML+=`<div>`+Object.keys(parts).reduce((accumulator,currentValue)=>
        accumulator+`<div id="품사-${currentValue}" class="filter-item" onclick="onOff(this);filter(this);">${currentValue}</div>`,
        ``
    )+`</div>`;
}

function special(letter){
    document.querySelector('input').value+=letter.textContent;
    document.querySelector('input').focus();
    search();
}

function filter(el){
    if(filtered==words){
        filtered=[];
    }
    if(el.id.split('-')[0]=='품사'){
        let tem=words.filter(row=>row[4]==el.id.split('-')[1]);
        if(el.classList.contains('selected')){
            filtered=words.filter(row=>filtered.includes(row)||tem.includes(row))
        }
        else{
            filtered=words.filter(row=>filtered.includes(row)&&!tem.includes(row))
        }
    }
    if(filtered.length==0){
        filtered=words;
    }
    search();
}

function onOff(el){
    el.classList.toggle('selected');
}

function search(){
    document.querySelector('#output').innerHTML='';
    const target=document.querySelector('input').value;
    if(target===''){
        document.querySelector('#default').style.display='block';
        document.querySelector('#output').style.display='none';
    }
    else{
        document.querySelector('#default').style.display='none';
        document.querySelector('#output').style.display='block';

        if(document.querySelector('#example').classList.contains('selected')){
            document.querySelectorAll('.filter-item').forEach(el=>{
                el.classList.remove('selected');
            });
            filtered=examples;
            
            filtered.filter(ex=>ex[0].toLowerCase().includes(target.toLowerCase())||ex[1].toLowerCase().includes(target.toLowerCase())||ex[3].includes(target)).forEach(ex=>{
                showExample(ex);
            });
        }
        else{
            const equalsTarget = filtered.filter(row =>
                (row[2] && row[2].split(', ').some(el=>el.split(':')[1]==target)) || row[3].split(', ').some(el=>el==target)
            );
            const startsWithTarget = filtered.filter(row =>
                !equalsTarget.includes(row) && (row[1].startsWith(target) || (row[2] && row[2].split(', ').some(el=>el.split(':')[1].startsWith(target))) || row[3].split(', ').some(el=>el.startsWith(target)))
            );
            
            const containsTarget = filtered.filter(row =>
                !equalsTarget.includes(row) && !startsWithTarget.includes(row) && (row[1].includes(target) || (row[2] && row[2].split(', ').some(el=>el.split(':')[1].includes(target))) || row[3].includes(target))
            );
            
            const targets = [...equalsTarget, ...startsWithTarget, ...containsTarget];
            
            targets.forEach(row=>{
                showWord(row);
            });
        }
    }
}

function showWord(word){
    let output=`<div class="margin-1"><sup>${word[0]}</sup><span class="title">${word[1]}</span></div>`;
    if(rules){
        let spelling=word[1];
        let pronunciation='';
        while(spelling!=''){
            for(const rule of rules){
                const ruleReg=new RegExp(`^${rule[0]}`);
                if(ruleReg.test(spelling)){
                    spelling=spelling.replace(ruleReg,'');
                    pronunciation+=rule[1];
                    break;
                }
                if(rule==rules[rules.length-1]){
                    spelling=spelling.slice(1);
                }
            }
        }
        output+=`<div class="small margin-1">/${pronunciation}/</div>`;
    }
    output+=`<div class="margin-1">${word[3]}</div>`;
    if(word[2]){
        word[2].split(', ').forEach(el=>{
           output+=`<div class="double"><b>${el.split(':')[0]}</b><span>${el.split(':')[1]}</span></div>`; 
        });
    }
    if(word[6]){
        properties=word[6].split(', ');
        output+=`<div class="box-inner emphasized margin-1">`;
        for(let i=0;i<properties.length;i++){
            output+=`<div class="double"><b>${properties[i].split(':')[0]}</b><span>${properties[i].split(':')[1]}</span></div>`;
        }
        output+=`</div>`;
    }
    if(word[8]){
        output+=`<div class="box-inner semi-emphasized small margin-1">${word[8]}</div>`;
    }
    if(word[7]){
        output+=`<div class="box-inner default center margin-1"><span>&lt;</span>`;
        origin=word[7].split(', ');
        for(let i=0;i<origin.length;i++){
            if(i!=0){
                output+=`<span style="color:var(--theme);">+</span>`;
            }
            if(origin[i].includes('(')){
                output+=`<span>${originWords[origin[i]][0]}</span>`;
            }
            else{
                output+=`<span>${words[words.findIndex(row=>row[0]===origin[i])][1]}</span>`;
            }
        }
        output+=`</div>`;
    }
    
    const newWord=document.createElement('div');
    newWord.innerHTML=output;
    newWord.className='box-variable default margin-2';
    document.querySelector('#output').appendChild(newWord);
}

function showExample(ex){
    let output=`<div class="margin-1">${ex[0]}</div>`;

    if(ex[1]){
        ex[1].split('/').forEach(el=>{
            output+=`<div class="margin-1">${el.split(':')[1]}</div>`;
        });
    }
    output+=`<div>${ex[3]}</div>`
    
    const newExample=document.createElement('div');
    newExample.innerHTML=output;
    newExample.className='box-variable default margin-2';
    document.querySelector('#output').appendChild(newExample);
}

fetchData();
