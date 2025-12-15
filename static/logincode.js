//--------------------- Javascript code for login page ---------------------------------


//-------------------------- Limiting functions ----------------------------------------
//function to limit white spaces in all input fields using regex
function preventWhiteSpaceInputs(){
    let inputs = document.getElementsByTagName('input');
    for(input of inputs){
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\s/g, '');
        });
    }
}

//function as a secondary check for white spaces in case the first one failed
function checkWhiteSpace(s) {
  return /\s/.test(s);
}


//------------------------------ Helper functions --------------------------------------
//function just adds an error message to a designated space on either page
//page 0 is the log in page (first log in page)
//page 1 is the create account page (second log in page)
//need timeout otherwise browser can't process change
function addErrorMessage(message, page){
    let error = document.getElementsByClassName('error')[page];
    error.innerHTML = '';
    error.classList.remove('fadeout');
    error.classList.add('snapin');
    setTimeout(function(){
        error.classList.remove('snapin');
        error.innerHTML = message;
        error.classList.add('fadeout');
    }, 20);
}

//function redirects user to another route on js side
//necessary because of apis
function manualRedirect(url){
    window.location.href = url;
}


//------------------------ Simple button functions -------------------------------------
//function executes when user clicks on 'create an account' in first login page
//opens second log in page
function openCreateAccPage(){
    let loginPage = document.getElementsByClassName('login-page');
    let createAccPage = document.getElementsByClassName('createacc-page');
    loginPage[0].style.display = 'none';
    createAccPage[0].style.display = 'grid';
}

//function executes when user clicks on 'return to login' in second login page
//opens first log in page
function openLoginPage(){
    let createAccPage = document.getElementsByClassName('createacc-page');
    let loginPage = document.getElementsByClassName('login-page');
    createAccPage[0].style.display = 'none';
    loginPage[0].style.display = 'grid';
}


//----------------------------- Api functions ------------------------------------------
//function executes when user clicks on 'sign in' on first login page
//checks for valid inputs
// -- sends error messages if not
// -- sends information to server if so
// -- --- server then decides if credentials are valid
// -- --- we log in based on that info
// -- --- log in happens on server side, redirect happens on this side
function loginUser(){
    const username = document.getElementById('loginusername').value;
    const password = document.getElementById('loginpassword').value;
    if(username === "" || password === ""){
        addErrorMessage('Username or password cannot be empty', 0);
        return;
    }
    else if(checkWhiteSpace(username) || checkWhiteSpace(password)){
        addErrorMessage('Username or password cannot contain whitespaces', 0);
        return;
    }
    else if(username.length > 36){
        addErrorMessage('Username exceeds character limit', 0);
        return;
    }
    else if(password.length > 72){
        addErrorMessage('Password exceeds character limit', 0);
        return;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            const success = JSON.parse(this.responseText).success;
            if(success){
                manualRedirect('/home');
            }
            else{
                addErrorMessage('Username or password did not match', 0)
            }
        }
    };
    const json_data = {'username': username, 'password': password}
    xhttp.open('POST', '/api/authUser', true);
    xhttp.send(JSON.stringify(json_data));
}

//function executes when user clicks on 'create account' on second login page
//checks for valid inputs
// -- sends error messages if not
// -- sends information to server if so
// -- --- server then decides if credentials are valid
// -- --- we log in based on that info
// -- --- log in happens on server side, redirect happens on this side
function createUser(){
    const username = document.getElementById('createusername').value;
    const password = document.getElementById('createpassword').value;
    if(username === "" || password === ""){
        addErrorMessage('Username or password cannot be empty', 1);
        return;
    }
    else if(checkWhiteSpace(username) || checkWhiteSpace(password)){
        addErrorMessage('Username or password cannot contain whitespaces', 1);
        return;
    }
    else if(username.length > 36){
        addErrorMessage('Username exceeds character limit', 1);
        return;
    }
    else if(password.length > 72){
        addErrorMessage('Password exceeds character limit', 1);
        return;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            const success = JSON.parse(this.responseText).success;
            if(success){
                manualRedirect('/home');
            }
            else{
                addErrorMessage('Username already exists', 1)
            }
        }
    };
    const json_data = {'username': username, 'password': password}
    xhttp.open('POST', '/api/createUser', true);
    xhttp.send(JSON.stringify(json_data));
}

//-------------------------- Global Execution ------------------------------------------
window.onload = preventWhiteSpaceInputs