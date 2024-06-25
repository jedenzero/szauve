const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];

async function fetchData(){
    const response=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:H?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
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
    var targets=[...words.filter(row=>row[1].startsWith(target)||row[2].startsWith(target)),...words.filter(row=>(!row[1].startsWith(target)&&row[1].includes(target)))||(!row[2].startsWith(target)&&row[2].includes(target))];
    targets.forEach(row=>{
        show(row);
    });
}

function show(word){
    let output=`
    <div class='word'>
    <div>${word[1]}</div>
    <div><div class='part'>${word[3]}</div><span>${word[2]}</span></div>
    <div>`;
    if(row[6]){
        origin=row[6].split(', ');
        for(let i=0;i<origin.length-1;i++){
            if(i!=0){
                output+=`<span style="color:#00FF7F;">+</span>`;
            }
            output+=`<span>${words[words.findIndex(row=>row[0]===origin[id])]}</span>`;
        } 
    }
    output+=`</div>
    <div>`;
    output+=`</div>
    </div>`;
    document.querySelector('#output').innerHTML+=output;
}

fetchData();