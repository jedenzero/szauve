const lang = new URLSearchParams(location.search).get('lang');
var codes = [];
var words = [];

fetch('https://sheets.googleapis.com/v4/spreadsheets/17ZVfLP8WImY1S--yA7gojHLiVjQO8InAYk3g28NAEfU/values/codes!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk')
.then(response=>response.json())
.then(data=>{
    if(lang){
        codes=data.values;
        words=getByCode(lang);
    }
    else{
        
    }
})
.catch(error=>console.error('Error:',error));

function getByCode(code){
    codes.forEach(row=>{
        if(row[1]===code){
            fetch(`https://sheets.googleapis.com/v4/spreadsheets/${row[0]}/values/${row[1]}!A:D?key=AIzaSyATLeHQh6kM0LWRJjLg8CmzoSdnntFrmFk`)
            .then(response=>response.json())
            .then(data=>{
                return data.values;
            })
            .catch(error=>console.error('Error:',error));
        }
    });
}