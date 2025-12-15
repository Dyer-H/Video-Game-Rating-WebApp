//--------------------- Javascript code for create page ---------------------------------
//Note: there is no way to limit input type=number effectively on some browsers
//-- therefore just do input check after receiving data



//------------------------------ Helper functions ---------------------------------------
//function just adds a message to a designated space on the page
//type = 0 is an error message (sets color to red)
//type = 1 is a good message (sets color to green)
function addMessage(message, type){
    let notice = document.getElementsByClassName('message')[0];
    if(type === 0){
        notice.style.color = 'red';
    }
    else{
        notice.style.color = 'green';
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


//----------------------------- Api functions -------------------------------------------
//function executes when user clicks 'create' button
//checks for valid name inputs
// -- if not display an error message
// -- if so send the data to server
// -- --- server creates new rating
// -- --- display good message
function createRating(){
    let name = document.getElementById('name');
    let rating = document.getElementById('rating').value;
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
            addMessage('Rating added', 1);
        }
    };
    const json_data = {'name': name.value.charAt(0).toUpperCase() + name.value.slice(1), 'rating': rating}
    name.value = '';
    xhttp.open('POST', '/api/createRating', true);
    xhttp.send(JSON.stringify(json_data));
}


//--------------------------- Global Execution ------------------------------------------
window.onload = displayRatingValue;