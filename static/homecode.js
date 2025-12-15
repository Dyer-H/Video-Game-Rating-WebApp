//----------------------- Javascript code for home page ---------------------------------


//----------------------------- Api functions -------------------------------------------
//makes a get request to server to get the data that belongs to the user
//then we display that data to user by modifying the DOM
function populateTable(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            const data = JSON.parse(this.responseText);
            const names = data.names;
            const ratings = data.ratings;
            const users = data.users;
            let table = document.getElementsByClassName('data')[0];
            for(i in names){
                let name = document.createElement('p');
                let rating = document.createElement('p');
                let user = document.createElement('p');
                name.innerText = names[i];
                rating.innerText = ratings[i];
                user.innerText = users[i];
                table.appendChild(name);
                table.appendChild(rating);
                table.appendChild(user);
            }
        }
    };
    xhttp.open('GET', '/api/getRatings', true);
    xhttp.send();
}


//--------------------------- Global Execution ------------------------------------------
window.onload = populateTable