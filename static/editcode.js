//--------------------- Javascript code for edit page ----------------------------------


//---------------------------- Global variables ----------------------------------------
//selectedRow keeps track of which row is selected at any time
//rowSelected keeps track of whether or not a row is selected
//elementsPerRow to simplify in case I wanted to change html
//ids keeps track of rating ids so server knows which ones to modify/delete

var selectedRow = 0;
var rowSelected = false;
var elementsPerRow = 2;
var ids = [];


//----------------------------- Helper functions ---------------------------------------
//function just adds a message to a designated space on the page
//type = 0 is an error message (sets color to red)
//type = 1 is a good message (sets color to blue)
function addMessage(message, type){
    let notice = document.getElementsByClassName('message')[0];
    if(type === 0){
        notice.style.color = 'red';
    }
    else{
        notice.style.color = 'blue';
    }
    notice.innerHTML = '';
    notice.classList.remove('fadeout');
    notice.classList.add('snapin');
    setTimeout(function(){
        notice.classList.remove('snapin');
        notice.innerHTML = message;
        notice.classList.add('fadeout');
    }, 20);
}

//function shows the value of the slider
function displayRatingValue(){
    let slider = document.getElementById('rating');
    let sliderValue = document.getElementById('slider-val');
    sliderValue.innerHTML = slider.value;
    slider.oninput = function(){
        sliderValue.innerHTML = this.value;
    };
}

//function highlights a row by changing the background color
// -- and text color of elements in a specific row
function highlightRow(row, data){
    let name = data[row*elementsPerRow];
    let rating = data[row*elementsPerRow + 1];
    name.style.backgroundColor = '#C3F14B';
    rating.style.backgroundColor = '#C3F14B';
    name.style.color = '#10201E';
    rating.style.color = '#10201E';
}

//function un-highlights a row by changing the background color
// -- and text color of elements in a specific row
function unHighlightRow(data){
    let name = data[selectedRow*elementsPerRow];
    let rating = data[selectedRow*elementsPerRow + 1];
    name.style.backgroundColor = 'transparent';
    rating.style.backgroundColor = 'transparent';
    name.style.color = '#C3F14B';
    rating.style.color = '#C3F14B';
}

//function populates input fields based on which row is selected
function populateInputFields(data){
    let name = data[selectedRow*elementsPerRow].innerText;
    let nameInput = document.getElementById('name');
    let rating = data[selectedRow*elementsPerRow + 1].innerText;
    let ratingInput = document.getElementById('rating');
    let ratingValue = document.getElementById('slider-val')
    nameInput.value = name;
    ratingInput.value = Number(rating);
    ratingValue.innerHTML = rating;
}

//function un-populates input fields
function unPopulateInputFields(){
    let nameInput = document.getElementById('name');
    let ratingInput = document.getElementById('rating');
    let ratingValue = document.getElementById('slider-val')
    nameInput.value = '';
    ratingInput.value = 5;
    ratingValue.innerHTML = '5';
}

//function updates elements in a row with new data based on selected row
function updateRowVisual(data, newName, newRating){
    let name = data[selectedRow*elementsPerRow];
    let rating = data[selectedRow*elementsPerRow + 1];
    name.innerText = newName;
    rating.innerText = newRating;
}

//function deletes elements in a row based on selected row
function deleteRowVisual(data){
    let name = data[selectedRow*elementsPerRow];
    let rating = data[selectedRow*elementsPerRow + 1];
    name.remove();
    rating.remove();
}


//------------------------------ Event listeners ---------------------------------------
//had to add event listener because I can't modify the
// -- 'onclick' element with the context of the element itself
//when an element is clicked
// -- gets the index of an element in the displayed table
// -- calculates the row based on that
// -- highlights row if either row is not highlighted
// -- --- or if row clicked is a different row from
// -- --- currently highlighted row
// -- otherwise just unhighlights row
// updates both rowSelected and selectedRow variables
function makeElementSelectable(element){
    element.addEventListener('click', function(){
        let data = document.getElementsByClassName('datum');
        let index = 0;
        for(datum of data){
            if (this === datum){
                break;
            }
            index++;
        }
        let row = Math.trunc(index/elementsPerRow);
        if (rowSelected && selectedRow === row){
            unHighlightRow(data);
            rowSelected = false;
        }
        else if (rowSelected){
            unHighlightRow(data);
            highlightRow(row, data);
        }
        else{
            highlightRow(row, data);
            rowSelected = true;
        }
        selectedRow = row;
        if (rowSelected){
            populateInputFields(data);
        }
        else{
            unPopulateInputFields();
        }
    });
}


//----------------------------- Api functions ------------------------------------------
//makes a get request to server to get the data that belongs to the user
//then we display that data to user by modifying the DOM
//we also get the ids of all elements and update the global variable 'ids' here
function populateTable(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            const data = JSON.parse(this.responseText);
            ids = data.ids;
            const names = data.names;
            const ratings = data.ratings;
            let table = document.getElementsByClassName('data')[0];
            for(i in names){
                let name = document.createElement('p');
                let rating = document.createElement('p');
                name.classList.add('datum');
                name.innerText = names[i];
                makeElementSelectable(name);
                rating.classList.add('datum');
                rating.innerText = ratings[i];
                makeElementSelectable(rating);
                table.appendChild(name);
                table.appendChild(rating);
            }
        }
    };
    xhttp.open('GET', '/api/getPersonalRatings', true);
    xhttp.send();
}

//function executes when user clicks 'update' button
//checks to see if a row is actually selected
// -- display error message otherwise
//checks for valid name input
// -- displays error message otherwise
//sends new rating data along with the id of element to be modified to server
// -- then executes a bunch of helper functions to update data visually to user
function updateRating(){
    if(!rowSelected){
        addMessage('Must select an entry before updating', 0);
        return;
    }
    let name = document.getElementById('name');
    let rating = document.getElementById('rating');
    if(name.value === ""){
        addMessage('Name cannot be empty', 0);
        return;
    }
    else if(name.value.length > 50){
        addMessage('Name exceeds character limit', 0);
        return;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            const rating_data = JSON.parse(this.responseText);
            name = rating_data.name;
            rating = rating_data.rating;
            let data = document.getElementsByClassName('datum');
            unPopulateInputFields();
            unHighlightRow(data);
            rowSelected = false;
            updateRowVisual(data, name, rating);
            addMessage('Rating updated', 1);
        }
    }
    const json_data = {'name': name.value.charAt(0).toUpperCase() + name.value.slice(1), 'rating': rating.value, 'id': ids[selectedRow]};
    xhttp.open('POST', '/api/updateRating', true);
    xhttp.send(JSON.stringify(json_data));
}

//function executes when user clicks 'delete' button
//checks to see if a row is actually selected
// -- display error message otherwise
//sends the id of element to be deleted to server
// -- then executes a bunch of helper functions to update data visually to user
// -- also removes that id from 'ids' global variable
function deleteRating(){
    if(!rowSelected){
        addMessage('Must select an entry before deleting', 0);
        return;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            let data = document.getElementsByClassName('datum');
            ids.splice(selectedRow, 1);
            unPopulateInputFields();
            unHighlightRow(data);
            rowSelected = false;
            deleteRowVisual(data);
            addMessage('Rating deleted', 1);
        }
    }
    const json_data = {'id': ids[selectedRow]};
    xhttp.open('POST', '/api/deleteRating', true);
    xhttp.send(JSON.stringify(json_data));
}


//--------------------------- Global Execution -----------------------------------------
window.onload = function(){
    populateTable();
    displayRatingValue();
};