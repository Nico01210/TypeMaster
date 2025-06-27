function afficherResultat(score, nbMotsProposes, tempsEcoule = null) {
    let spanScore = document.querySelector(".zoneScore span")
    let affichageScore = `${score} / ${nbMotsProposes}`
    if (tempsEcoule !== null) {
        affichageScore += ` | Temps : ${tempsEcoule}s`
    }
    spanScore.innerText = affichageScore
}

/**
 * Cette fonction affiche une proposition, que le joueur devra recopier, 
 * dans la zone "zoneProposition"
 * @param {string} proposition : la proposition à afficher
 */
function afficherProposition(proposition) {
    let zoneProposition = document.querySelector(".zoneProposition")
    zoneProposition.innerText = proposition
}

/**
 * Cette fonction construit et affiche l'email. 
 * @param {string} nom : le nom du joueur
 * @param {string} email : l'email de la personne avec qui il veut partager son score
 * @param {string} score : le score. 
 */
function afficherEmail(nom, email, score, tempsEcoule = null) {
    let subject = encodeURIComponent("Partage du score Azertype")
    let body = `Salut, je suis ${nom} et je viens de réaliser le score ${score}`
    if (tempsEcoule !== null) {
        body += ` en ${tempsEcoule} secondes`
    }
    body += " sur le site d'Azertype !"
    body = encodeURIComponent(body)
    let mailto = `mailto:${email}?subject=${subject}&body=${body}`
    location.href = mailto
}

/**
 * Cette fonction prend un nom en paramètre et valide qu'il est au bon format
 * ici : deux caractères au minimum
 * @param {string} nom 
 * @throws {Error}
 */
function validerNom(nom) {
    if (nom.length < 2) {
        throw new Error("Le nom est trop court. ")
    }
    
}

/**
 * Cette fonction prend un email en paramètre et valide qu'il est au bon format. 
 * @param {string} email 
 * @throws {Error}
 */
function validerEmail(email) {
    let emailRegExp = new RegExp("[a-z0-9._-]+@[a-z0-9._-]+\\.[a-z0-9._-]+")
    if (!emailRegExp.test(email)) {
        throw new Error("L'email n'est pas valide.")
    }
    
}

/**
 * Cette fonction affiche le message d'erreur passé en paramètre. 
 * Si le span existe déjà, alors il est réutilisé pour ne pas multiplier
 * les messages d'erreurs. 
 * @param {string} message 
 */
function afficherMessageErreur(message) {
    
    let spanErreurMessage = document.getElementById("erreurMessage")

    if (!spanErreurMessage) {
        let popup = document.querySelector(".popup")
        spanErreurMessage = document.createElement("span")
        spanErreurMessage.id = "erreurMessage"
        
        popup.append(spanErreurMessage)
    }
    
    spanErreurMessage.innerText = message
}

/**
 * Cette fonction permet de récupérer les informations dans le formulaire
 * de la popup de partage et d'appeler l'affichage de l'email avec les bons paramètres.
 * @param {string} scoreEmail 
 */
function gererFormulaire(scoreEmail, tempsEcoule = null) {
    try {
        let baliseNom = document.getElementById("nom")
        let baliseEmail = document.getElementById("email")
        if (!baliseNom || !baliseEmail) {
            afficherMessageErreur("Formulaire incomplet : champ nom ou email manquant.")
            return
        }
        let nom = baliseNom.value
        validerNom(nom)
        let email = baliseEmail.value
        validerEmail(email)
        afficherMessageErreur("")
        afficherEmail(nom, email, scoreEmail, tempsEcoule)
    } catch(erreur) {
        afficherMessageErreur(erreur.message)
    }
    
}

/**
 * Mélange un tableau en place (Fisher-Yates)
 * @param {Array} array 
 * @returns {Array}
 */
function melangerTableau(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Cette fonction lance le jeu. 
 * Elle demande à l'utilisateur de choisir entre "mots" et "phrases" et lance la boucle de jeu correspondante
 */
function lancerJeu() {
    // Initialisations
    initAddEventListenerPopup()
    let score = 0
    let i = 0
    let listeProposition = melangerTableau([...listeMots])
    let btnValiderMot = document.getElementById("btnValiderMot")
    let inputEcriture = document.getElementById("inputEcriture")
    let debut = null
    let tempsEcoule = null

    afficherProposition(listeProposition[i])

    // Gestion de l'événement click sur le bouton "valider"
    function validerMot() {
        if (debut === null) debut = Date.now()
        if (inputEcriture.value === listeProposition[i]) {
            score++
        }
        afficherResultat(score, i + 1)
        inputEcriture.value = ''
        i++
        if (listeProposition[i] === undefined) {
            // Fin de partie
            tempsEcoule = Math.round((Date.now() - debut) / 1000)
            afficherProposition("Le jeu est fini")
            afficherResultat(score, i, tempsEcoule)
            btnValiderMot.disabled = true
        } else {
            afficherProposition(listeProposition[i])
        }
    }

    btnValiderMot.addEventListener("click", validerMot)
    inputEcriture.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            validerMot()
        }
    })

    // Gestion de l'événement change sur les boutons radios. 
    let listeBtnRadio = document.querySelectorAll(".optionSource input")
    for (let index = 0; index < listeBtnRadio.length; index++) {
        listeBtnRadio[index].addEventListener("change", (event) => {
            if (event.target.value === "1") {
                listeProposition = melangerTableau([...listeMots])
            } else {
                listeProposition = melangerTableau([...listePhrases])
            }
            // Réinitialisation de la partie
            i = 0
            score = 0
            debut = null
            tempsEcoule = null
            btnValiderMot.disabled = false
            afficherResultat(score, i)
            afficherProposition(listeProposition[i])
            inputEcriture.value = ''
        })
    }

    // Gestion de l'événement submit sur le formulaire de partage. 
    let form = document.querySelector("form")
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        let scoreEmail = `${score} / ${i}`
        gererFormulaire(scoreEmail, tempsEcoule)
    })

    afficherResultat(score, i)
}