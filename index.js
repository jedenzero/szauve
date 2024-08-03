const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];
var examples = [];
var specials = [];
var clicked = null;
var test = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]*$/;

async function fetchData(){
    const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:E?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
    const data=await response.json();
    if(lang){
        codes=data.values;
        await getByCode();
        setGrid();
    }
    else{
        
    }
}

async function getByCode(){
    for(const row of codes){
        if(row[1]===lang){
            const response1=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:I?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data1=await response1.json();
            words=data1.values
            const response2=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]+'-ex'}!A:C?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`);
            const data2=await response2.json();
            examples=data2.values
        }
    }
}

function setGrid(){
    // 특수문자 추리기
    /**
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
    **/
    // 환영인사
    for(const row of codes){
        if(row[1]===lang){
            if(row[4]){
                document.documentElement.style.setProperty('--special-color', row[4]);
            }
            document.querySelector('#welcome').innerHTML=`<span style="font-size:2rem;font-weight:bold;">${row[3]}</span><div><b>${row[2]}</b> 사전입니다.</div>`;
        }
    }
    // 단어 수
    document.querySelector('#words').innerHTML=`<div style="font-size:0.8rem;">단어</div>
    <div style="text-align:center;">
    <span style="font-size:2rem;font-weight:bold;">${words.length}</span><span style="font-size:0.8rem;">개</span>
    </div>`;
    var parts={};
    var long=['',''];
    for(const row of words){
        //품사
        if(!Object.keys(parts).includes(row[4])){
            parts[row[4]]=1;
        }
        else{
            parts[row[4]]++;
        }
        // 가장 긴 단어
        if(row[1].length>long[1].length){
            long=row;
        }
    }
    // 품사
    document.querySelector('#parts').innerHTML=`<div style="font-size:0.8rem;">품사</div>
    <div style="text-align:center;">
    <span style="font-size:2rem;font-weight:bold;">${Object.keys(parts).length}</span><span style="font-size:0.8rem;">개</span>
    </div>`;
    document.querySelector('#long').innerHTML=`<div>가장 긴 단어</div>
    <div><sup>${long[0]}</sup><span>${long[1]}</span></div>
    <div>${long[3].split(', ')[0]}</div>`;
    // 무작위 단어
    var random=words[Math.floor(words.length*Math.random())];
    document.querySelector('#random').innerHTML=`<div>무작위 단어</div>
    <div><sup>${random[0]}</sup><span>${random[1]}</span></div>
    <div>${random[3].split(', ')[0]}</div>`;
    // 그래프
    document.querySelector('#graph').innerHTML+=`<canvas id="parts-graph"></canvas>`;
    const ctx = document.getElementById('parts-graph').getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(parts),
        datasets: [{
          data: Object.values(parts).map(el=>el/words.length*100),
          backgroundColor: Array(parts.length).fill(document.documentElement.style.getPropertyValue('--normal-color')),
          hoverBackgroundColor: Array(parts.length).fill(document.documentElement.style.getPropertyValue('--special-color')),
          borderColor: Array(parts.length).fill(document.documentElement.style.getPropertyValue('--background-color')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: 'false'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });

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
        document.querySelector('#graph').style.display='grid';
        document.querySelector('#output').style.display='none';
    }
    else{
        document.querySelector('#c1').style.display='none';
        document.querySelector('#c2').style.display='none';
        document.querySelector('#graph').style.display='none';
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
