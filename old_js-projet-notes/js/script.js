console.log( 'ça marche' );

// DOMContentLoaded est l'événement qui est emis lorsque le navigateur a terminé de fabriquer le DOM
document.addEventListener( 'DOMContentLoaded', function(){
    // Tout le code de l'application va se trouver ici, comme on est sûr que les recherche dans le DOM
    // que l'on va faire produiront un résultat

    let 
        // Tableau des notas
        arrNotas = [],
        // Flag de mode edition
        isEditing = false;

    const 
        // Modele de données d'un Nota
        notaModel = {
            dateCreate: 0,
            dateUpdate: 0,
            title: '',
            content: ''
        },

        // Eléments de l'UI
        elBtnBoardClear = document.getElementById( 'btn-board-clear' ),
        elForm = document.forms[0],
        elNewTitle = document.getElementById( 'new-nota-title' ),
        elNewContent = document.getElementById( 'new-nota-content' ),
        elBoard = document.getElementById( 'board' ),

        // Gestionnaires d'événements
        /**
         * Gestionnaire d'événements désactivation erreur d'un champ de saisie
         */
        handlerRemoveError = function() {
            this.classList.remove( 'error' );
        },

        /**
         * Gestionnaire d'événement de purge des Notas
         */
        handlerBoardClear = function() {
            if( isEditing ) return;

            arrNotas = []; // Vidange du tableau de Notas
            elBoard.innerHTML = ''; // Vidange du contenu affiché de board
            localStorage.removeItem( 'notabene' );
        },

        /**
         * Gestionnaire d'événement de soumission du formulaire d'ajout
         */
        handlerSubmitNew = function( evt ) {
            // preventDefault() empêche le comportement initial de l'événement (ici le rechargement de la page)
            evt.preventDefault();

            if( isEditing ) return;
            
            // Contrôle de la saisie
            let 
                hasError = false,
                regAlphaNum = new RegExp('^[A-Za-z0-9 ]+$'),
                strTitle = elNewTitle.value.trim(),
                strContent = elNewContent.value.trim();

            // --- Traitement des erreur

            // -- Title
            // - Si la chaine est vide 
            // - ou contient autre chose que des chiffres et des lettres
            // => ERREUR
            if( !regAlphaNum.test( strTitle ) ) {
                hasError = true;
                elNewTitle.value = '';
                elNewTitle.classList.add( 'error' );
            }

            // -- Content
            // Si la chaine est vide: ERREUR
            if( strContent.length <= 0 ) {
                hasError = true;
                elNewContent.classList.add( 'error' );
            }

            // S'il y a au moins une erreur on interrompt le traitement
            if( hasError ) return;

            // Vidange du formulaire
            elNewTitle.value
                = elNewContent.value
                = '';

            // Traitement des données
            const newNota = Object.create( notaModel );

            newNota.dateCreate 
                = newNota.dateUpdate 
                = Date.now();
            newNota.title = strTitle;
            newNota.content = strContent;

            // Enregistrement
            // Array.push() permet d'insérer une valeur à fin d'un tableau
            arrNotas.push( newNota );

            // Mise à jour de l'affichage
            renderNotas();

            // Persistance des données
            saveNotas();
        },

        // Fonction de DOM
        /**
         * Génére le DOM pour un Nota donné
         * - nota Objet de modèle de donnée d'un Nota
         * 
         * - return HTMLLiElement li d'affichage d'un Nota
         */
        getNotaDOM = function( nota ) {
            /*
            MODELE HTML D'UN NOTA
            <li class="nota">
                <div class="inner">
                    <div class="top-bar">
                        <div class="info">
                            <div class="nota-datetime">09/03/2022 - 15:18:25</div>
                            <div class="nota-title">Toto à la plage</div>
                        </div>
                        <div class="cmd-bar">
                            <button type="button" class="btn nota-save hidden">💾</button>
                            <button type="button" class="btn nota-edit">✏️</button>
                            <button type="button" class="btn nota-delete">🗑️</button>
                        </div>
                    </div>
                    <div class="content-bar">
                        <div class="nota-content">BLA BLA BLA BLA</div>
                    </div>
                </div>
            </li>
            */
    
           const 
                // <li class="nota">
                elNota = document.createElement( 'li' ),
                handlerNota = function( evt ) {
                    const 
                        role = evt.target.dataset.role,
                        arrEditable = this.querySelectorAll( '[data-editable]' ),
                        elTitle = this.querySelector( '.nota-title' ),
                        elContent = this.querySelector( '.nota-content' ),
                        elEdit = this.querySelector( '.nota-edit' ),
                        elDelete = this.querySelector( '.nota-delete' ),
                        elSave = this.querySelector( '.nota-save' ),
                        // this represent ici le LI du bouton cliqué
                        // Array.from() permet d'obtenir un Array à partir de n'importe quoi
                        // d'autre compatible (ex: HTMLCollection)
                        // Cela permet d'utiliser toutes les méthodes de Array
                        idxLi = Array.from(elBoard.children).indexOf( this );

                    switch( role ) {
                        case 'edit':
                            if( isEditing ) return;
                            isEditing = true;

                            elEdit.classList.add( 'hidden' );
                            elDelete.classList.add( 'hidden' );
                            elSave.classList.remove( 'hidden' );

                            for( let el of arrEditable ) {
                                el.classList.add( 'form-control' );
                                el.contentEditable = true;
                            }
                            break;

                        case 'save':
                            isEditing = false;

                            elEdit.classList.remove( 'hidden' );
                            elDelete.classList.remove( 'hidden' );
                            elSave.classList.add( 'hidden' );

                            for( let el of arrEditable ) {
                                el.classList.remove( 'form-control' );
                                el.contentEditable = false;
                            }

                            // TODO: Idéalement il faut recontrôler la saisie

                            // MàJ du Nota
                            let nota = arrNotas[idxLi];
                            nota.title = elTitle.textContent;
                            nota.content = elContent.textContent;
                            nota.dateUpdate = Date.now();

                            renderNotas();
                            saveNotas();
                        break;

                        case 'delete':
                            if( isEditing ) return;

                            arrNotas.splice( idxLi, 1 );
                            renderNotas();
                            saveNotas();

                            break;

                        default:
                            return;
                    }
                };
            let
                strDOM = '',
                date = new Date(nota.dateUpdate),
                strDatetime = date.toLocaleString();
    
            // Construction du DOM à l'intérieur de elNota
            strDOM += '<div class="inner">';
            strDOM +=       '<div class="top-bar">';
            strDOM +=           '<div class="info">';
            strDOM +=               `<div class="nota-datetime">${strDatetime}</div>`;
            strDOM +=               `<div class="nota-title" data-editable>${nota.title}</div>`;
            strDOM +=           '</div>';
            strDOM +=           '<div class="cmd-bar">';
            strDOM +=               '<button type="button" data-role="save" class="btn nota-save hidden">💾</button>';
            strDOM +=               '<button type="button" data-role="edit" class="btn nota-edit">✏️</button>';
            strDOM +=               '<button type="button" data-role="delete" class="btn nota-delete">🗑️</button>';
            strDOM +=           '</div>';
            strDOM +=       '</div>';
            strDOM +=       '<div class="content-bar">';
            strDOM +=           `<div class="nota-content" data-editable>${nota.content}</div>`;
            strDOM +=       '</div>';
            strDOM += '</div>';
    
            // <li class="nota">
            elNota.classList.add( 'nota' );
            elNota.innerHTML = strDOM;
            elNota.addEventListener( 'click', handlerNota );
    
            return elNota;
        },
        
        /**
         * Recrée la liste de notas à l'affichage après les avoir réordonnés
         */
        renderNotas = function() {
            // Tri par date
            /*
            arrNotas.sort( function( notaA, notaB ) {
                return notaB.dateUpdate - notaA.dateUpdate;
            });
            */

            // Syntaxe avec fonction fléchée
            arrNotas.sort( ( notaA, notaB ) => notaB.dateUpdate - notaA.dateUpdate );

            // Vidange de l'affichage actuel
            elBoard.innerHTML = '';

            /*
            for( let nota of arrNotas ) {
                const li = getNotaDOM( nota );
                elBoard.append( li );
            }
            */

            // Format raccourci
            for( let nota of arrNotas ) elBoard.append( getNotaDOM( nota ) );
        },
        saveNotas = function() {
            let strNotas = JSON.stringify( arrNotas );
            localStorage.setItem( 'notabene', strNotas );
        };
    
    // - Initialisation des gestionnaires d'événement
    elBtnBoardClear.addEventListener( 'click', handlerBoardClear );
    elForm.addEventListener( 'submit', handlerSubmitNew );
    elNewTitle.addEventListener( 'focus', handlerRemoveError );
    elNewContent.addEventListener( 'focus', handlerRemoveError );

    // Chargement des données enregistrées
    let itemStorage = localStorage.getItem( 'notabene' );

    // Si le stockage n'est pas encore crée on ne pass à la suite
    if( itemStorage === null ) return;

    // conversion en JSON
    try {
        let jsonNotas = JSON.parse( itemStorage );
        arrNotas = jsonNotas;

        renderNotas();
    }
    catch( e ) {
        localStorage.removeItem( 'notabene' );
    }

});
