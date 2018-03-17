//Language
firebase.auth().useDeviceLanguage();


//Register
function loginloadingready() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.setTimeout(() => {
			    document.querySelector('#navigator').resetToPage('chats.html', {animation: 'fade-ios'}, {animationOptions: {duration: 0.2, delay: 0.4, timing: 'ease-in'}});
            }, 600);
        } else {
            window.setTimeout(() => {
			    document.querySelector('#navigator').pushPage('login.html', {animation: 'fade-ios'}, {animationOptions: {duration: 0.2, delay: 0.4, timing: 'ease-in'}});
            }, 600);
        }
    });
}

function loginSend() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() {
            var email = document.getElementById("email-form-login").value;
            var password = document.getElementById("password-form-login").value;
            if(isFormValid(email, password)[0] == true){
                firebase.auth().signInWithEmailAndPassword(email, password).then(()=> {
                    getCryptoKeys();
                    document.querySelector('#navigator').resetToPage('chats.html', {animation: 'fade-ios'}, {animationOptions: {duration: 0.2, delay: 0.4, timing: 'ease-in'}});                    
                }).catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // ...
                    ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: ' + errorCode, {"title": "Hier stimmt was nicht..."});
                });
            }
            else {
                if(isFormValid(email, password)[1] == "invalid Password"){
                    ons.notification.alert('Dein Passwort ist ungültig. Bitte nehme ein Passwort, dass länger als 8 Zeichen ist.', {"title": "Ungültiges Passwort"});
                }
                else if(isFormValid(email, password)[1] == "invalid Email"){
                    ons.notification.alert('Deine Email ist ungültig. Bitte gib eine gültige Email ein.', {"title": "Ungültige Email"});
                }
                else {
                    ons.notification.alert('Irgendwas stimmt hier nicht. Bitte versuche es erneut!', {"title": "Hä?"});
                }
            }
        }
    )
}

function registerSend() {
    var email = document.getElementById("email-form-register").value;
    var password = document.getElementById("password-form-register").value;
    var phoneno = document.getElementById("phoneno-form-register").value;
    var name = document.getElementById("name-form-register").value;
    if(isFormValid(email, password)[0] == true){
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(()=>{
            jQuery.ajax("http://flare.nikzu.de/old/addUser.php?id=" + firebase.auth().currentUser.uid + "&phonenumber=" + phoneno)
            .done(function() {
                var tempname = name.split(" ");
                ons.notification.alert('Du hast dich Erfolgreich registriert! Andere können dich jetzt unter deiner Nummer ' + phoneno + ' finden.', {"title": "Vielen Dank, " + tempname[0] + "!"});
                firebase.auth().currentUser.updateProfile({
                    displayName: name,
                    phoneNumber: phoneno
                })  
                initializeCryptoKeys();
                document.querySelector('#navigator').resetToPage('chats.html', {animation: 'fade-ios'}, {animationOptions: {duration: 0.2, delay: 0.4, timing: 'ease-in'}});
            })
            .fail(function() {
                ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: createAddPhonenoDatabase', {"title": "Hier stimmt was nicht..."});
            })
        }) 
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;

            ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: ' + errorCode, {"title": "Hier stimmt was nicht..."});
        });
    }
    else {
        if(isFormValid(email, password)[1] == "invalid Password"){
            ons.notification.alert('Dein Passwort ist ungültig. Bitte nehme ein Passwort, dass länger als 8 Zeichen ist.', {"title": "Ungültiges Passwort"});
        }
        else if(isFormValid(email, password)[1] == "invalid Email"){
            ons.notification.alert('Deine Email ist ungültig. Bitte gib eine gültige Email ein.', {"title": "Ungültige Email"});
        }
        else {
            ons.notification.alert('Irgendwas stimmt hier nicht. Bitte versuche es erneut!', {"title": "Hä?"});
        }
    }
}

function startRegister() {
    document.querySelector('#navigator').pushPage('register.html', {animation: 'lift-ios'});                        
}

function returnToLogin() {
    document.querySelector('#navigator').popPage();                           
}


//Validation
function isEmailValid(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
    } else {
        return false;
    }
}

function isPasswordValid(pw) {
    if (pw.length > 7) {
        return true;
    }
    else {
        return false;
    }
}

function isFormValid(mail, pw) {
    if(isEmailValid(mail) && isPasswordValid(pw)) {
        return [true, ""];
    }
    else {
        if(isEmailValid(mail) && !isPasswordValid(pw)) {
            return [false, "invalid Password"];
        }
        else if(!isEmailValid(mail) && isPasswordValid(pw)) {
            return [false, "invalid Email"];
        }
    }
}


//Contacts
var contactList = [];

function refreshContacts() {
    searchForFriends();
    setTimeout(() => {
        writeNewList();
    }, 10000);
}

function searchForFriends() {
    contactList = [];
    var options = new ContactFindOptions();
    options.multiple = true;
    options.desiredFields = [navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumbers];
    options.hasPhoneNumber = true;
    var fields = [navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumbers];
    navigator.contacts.find(fields, (contacts) => {
        for(var i = 0; i < contacts.length; i++) {
            if(contacts[i].name.formatted != null){
                let name = contacts[i].name.formatted;
                let phonenos = contacts[i].phoneNumbers;
                for(var j = 0; j < phonenos.length; j++) {
                    //console.log(name);
                    //console.log(phonenos[j].value);
                    //console.log("***");
                    let phoneno = phonenos[j].value;
                    if(!phoneno.includes("*")) {
                        while (phoneno.includes(" ")){
                            phoneno = phoneno.replace(" ", "");
                        }
                        while (phoneno.includes("-")){
                            phoneno = phoneno.replace("-", "");
                        }
                        while (phoneno.includes("/")){
                            phoneno = phoneno.replace("/", "");
                        }
                        if (phoneno.startsWith("00")) {
                            phoneno = phoneno.substr(2);
                            phoneno = "+" + phoneno;
                        }
                        if (firebase.auth().languageCode == "de-DE" && phoneno.includes("+") == false){
                            phoneno = phoneno.substr(1);
                            phoneno = "+49" + phoneno;
                        }
                        
                        jQuery.ajax("http://flare.nikzu.de/old/isUser.php?phonenumber=" + phoneno)
                        .done(function(data) {
                            if (data.includes("null") == false) {
                                var dataObj = JSON.parse(data);
                                contactList.push({"name": name, "phoneno": phoneno, "id": dataObj.id, "public": dataObj.publickey});
                                console.log({"name": name, "phoneno": phoneno, "id": dataObj.id, "public": dataObj.publickey});
                            }
                        })
                        .fail(function() {
                            ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: getPhoneFromDatabase', {"title": "Hier stimmt was nicht..."});
                        })
                    }
                }
            }
        }
    }, (e) => {
       console.warn(e); 
    }, options);
}

function writeNewList() {
    console.log("Writing");
    var HTML = "";
    var prevnumbers = ""
    for(var i = 0; i < contactList.length; i++) {
        if (!prevnumbers.includes(contactList[i].phoneno)){
            prevnumbers += " " + contactList[i].phoneno;
            HTML += `
            <ons-list-item>
                <div class="left">
                    <img class="list-item__thumbnail" src="https://placekitten.com/g/40/40">
                </div>
                <div class="center">
                    <span class="list-item__title">` + contactList[i].name + `</span><span class="list-item__subtitle">` + contactList[i].phoneno + `</span>
                </div>
            </ons-list-item>`;
        }
    }
    document.getElementById("contacts-list-contacts").innerHTML = HTML;

    localStorage.setItem("contactlist", JSON.stringify(contactList));
}

function writeList() {
    contactList = JSON.parse(localStorage.getItem("contactlist"));

    var HTML = "";
    var prevnumbers = ""
    for(var i = 0; i < contactList.length; i++) {
        if (!prevnumbers.includes(contactList[i].phoneno)){
            prevnumbers += " " + contactList[i].phoneno;
            HTML += `
            <ons-list-item>
                <div class="left">
                    <img class="list-item__thumbnail" src="https://placekitten.com/g/40/40">
                </div>
                <div class="center">
                    <span class="list-item__title">` + contactList[i].name + `</span><span class="list-item__subtitle">` + contactList[i].phoneno + `</span>
                </div>
            </ons-list-item>`;
        }
    }
    document.getElementById("contacts-list-contacts").innerHTML = HTML;
}


//Message En-/Decryption
function initializeCryptoKeys() {
    localStorage.setItem("passphrase", createRandomString());
    let pubkey = cryptico.publicKeyString(cryptico.generateRSAKey(firebase.auth().currentUser.uid + localStorage.getItem("passphrase"), 1024));
    jQuery.ajax("http://flare.nikzu.de/old/addPublicToUser.php?id=" + firebase.auth().currentUser.uid + "&publickey=" + pubkey)
        .done(function() {
        })
        .fail(function() {
            ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: communicatePublic', {"title": "Hier stimmt was nicht..."});
        })
    jQuery.ajax("http://flare.nikzu.de/old/addPass.php?id=" + firebase.auth().currentUser.uid + "&pass=" + localStorage.getItem("passphrase"))
        .done(function() {

        })
        .fail(function() {
            ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: communicatePublic', {"title": "Hier stimmt was nicht..."});
        })
}

function getCryptoKeys() {
    jQuery.ajax("http://flare.nikzu.de/old/getPass.php?id=" + firebase.auth().currentUser.uid)
        .done(function(data) {
            var dataObj = JSON.parse(data);
            localStorage.setItem("passphrase", dataObj.pass);
        })
        .fail(function() {
            ons.notification.alert('Hier ist irgendwas schiefgelaufen. Bitte stelle sicher, dass du mit dem Internet verbunden bist. Für weitere hilfe, wende dich an info@nikzu.de oder @SocialFlareApp auf Twitter mit folgendem Code: createAddPhonenoDatabase', {"title": "Hier stimmt was nicht..."});
        })
}

function createRandomString() {
    var string = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 10; i++){
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return string;
}

function decryptMessage(cipher) {
    return cryptico.decrypt(cipher, cryptico.generateRSAKey(firebase.auth().currentUser.uid + localStorage.getItem("passphrase"), 1024))
}

function encryptMessage(message, personKey) {
    return cryptico.encrypt(message, personKey)
}


//Chats
function prewriteChats() {
    if(localStorage.getItem("chats") != null) {
        var chats = localStorage.getItem("chats").split("<|break|>");
        var HTML = "";

        for (var i = 0; i < chats.length; i++){
            var tempChats = JSON.parse(chats[i]);
            HTML += `
                <ons-list-item>
                    <div class="left">
                        <img class="list-item__thumbnail" src="https://placekitten.com/g/40/40">
                    </div>
                    <div class="center">
                        <span class="list-item__title">` + tempChats.name + `</span><span class="list-item__subtitle">` + tempChats.lastMessage + `</span>
                    </div>
                </ons-list-item>`;
        }

        document.getElementById("chats-list-chats").innerHTML = HTML;
    }
}