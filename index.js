const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];

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
            const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
            const data=await response.json();
            return data.values;
        }
    }
}

function search(){
    document.querySelector('#output').innerHTML='';
    const target=document.querySelector('input').value;
    var targets=[...words.filter(row=>row[1].startsWith(target)),...words.filter(row=>!row[1].startsWith(target)&&row[1].includes(target))];
    targets.forEach(row=>{
        show(row);
    });
}

function show(word){
    document.querySelector('#output').innerHTML+=`
    <div class='word'>
    <div>${word[1]}</div>
    <div>${word[2]}</div>
    <div>어원</div>
    <div>기타 속성</div>
    </div>
    `;
}