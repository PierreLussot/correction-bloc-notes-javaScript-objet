import '../../assets/css/reset.css';
import '../../assets/css/style.css';

import {LocalStorageService} from "./Service/LocalStorageService";
import {Nota} from "./Entity/Nota";

const STORAGE_KEY = 'lidem-post-it';

class App {
    notesStorage = null;

    // Tableau des notas
    arrNotas = [];

    // Flag de mode edition
    isEditing = false;

    // Eléments de l'UI
    elBtnBoardClear = null;
    elForm = null;
    elNewTitle = null;
    elNewContent = null;
    elBoard = null;

    constructor() {
        this.notesStorage = new LocalStorageService(STORAGE_KEY);

        this.elBtnBoardClear = document.getElementById('btn-board-clear');
        this.elForm = document.forms[0];
        this.elNewTitle = document.getElementById('new-nota-title');
        this.elNewContent = document.getElementById('new-nota-content');
        this.elBoard = document.getElementById('board');
    }

    /**
     * Démarre l'application
     */
    start() {
        console.info('Starting App...');

        // - Initialisation des gestionnaires d'événement
        this.elBtnBoardClear.addEventListener('click', this.handlerBoardClear.bind(this));
        this.elForm.addEventListener('submit', this.handlerSubmitNew.bind(this));
        this.elNewTitle.addEventListener('focus', this.handlerRemoveError.bind(this));
        this.elNewContent.addEventListener('focus', this.handlerRemoveError.bind(this));

        // Evénements de la class Nota
        document.addEventListener('notaEdit', this.handlerNotaEdit.bind(this));
        document.addEventListener('notaSave', this.handlerNotaSave.bind(this));
        document.addEventListener('notaDelete', this.handlerNotaDelete.bind(this));

        let itemStorage = this.notesStorage.getJSON();

        // Si le stockage n'est pas encore crée on ne pass à la suite
        if (itemStorage === null) return;

        for (let notaJSON of itemStorage) this.arrNotas.push(new Nota(notaJSON));

        this.render();
    }

    render() {
        // Tri par date
        this.arrNotas.sort((notaA, notaB) => notaB.dateUpdate - notaA.dateUpdate);

        // Vidange de l'affichage actuel
        this.elBoard.innerHTML = '';

        for (let nota of this.arrNotas) this.elBoard.append(nota.getDOM());
    }

    // Gestionnaires d'événements
    /**
     * Gestionnaire d'événements désactivation erreur d'un champ de saisie
     */
    handlerRemoveError(evt) {
        evt.target.classList.remove('error');
    }

    /**
     * Gestionnaire d'événement de purge des Notas
     */
    handlerBoardClear() {
        if (this.isEditing) return;
        const
            msg = `vous etes sur le point de supprimer definitivement  TOUS LES NOTAS`,
            userApprobation = confirm(msg);
        if (!userApprobation) return;

        this.arrNotas = []; // Vidange du tableau de Notas
        this.elBoard.innerHTML = ''; // Vidange du contenu affiché de board
        this.notesStorage.clear();
    }

    /**
     * Gestionnaire d'événement de soumission du formulaire d'ajout
     */
    handlerSubmitNew(evt) {
        // preventDefault() empêche le comportement initial de l'événement (ici le rechargement de la page)
        evt.preventDefault();

        if (this.isEditing) return;

        // Contrôle de la saisie
        let
            hasError = false,
            regAlphaNum = new RegExp('^[A-Za-z0-9 ]+$'),
            strTitle = this.elNewTitle.value.trim(),
            strContent = this.elNewContent.value.trim();

        // --- Traitement des erreur

        // -- Title
        // - Si la chaine est vide
        // - ou contient autre chose que des chiffres et des lettres
        // => ERREUR
        if (!regAlphaNum.test(strTitle)) {
            hasError = true;
            this.elNewTitle.value = '';
            this.elNewTitle.classList.add('error');
        }

        // -- Content
        // Si la chaine est vide: ERREUR
        if (strContent.length <= 0) {
            hasError = true;
            this.elNewContent.classList.add('error');
        }

        // S'il y a au moins une erreur on interrompt le traitement
        if (hasError) return;

        // Vidange du formulaire
        this.elNewTitle.value
            = this.elNewContent.value
            = '';

        // Traitement des données
        const newNota = {};

        newNota.dateCreate
            = newNota.dateUpdate
            = Date.now();
        newNota.title = strTitle;
        newNota.content = strContent;

        // Enregistrement
        this.arrNotas.push(new Nota(newNota));

        // Mise à jour de l'affichage
        this.render();

        // Persistance des données
        this.notesStorage.setJSON(this.arrNotas);
    }

    handlerNotaEdit(evt) {
        //console.log(evt);
        //console.log(this.arrNotas);

        this.isEditing = true;
    }

    handlerNotaSave(evt) {
        console.log(evt);
        console.log(this.arrNotas);
        this.isEditing = false;
        this.render();
        this.notesStorage.setJSON( this.arrNotas );

    }

    handlerNotaDelete(evt) {
        // console.log( evt );
        // console.log( this.arrNotas );
        if (this.isEditing) return;
        const
            nota = evt.detail.nota,
            msg = `vous etes sur le point de supprimer definitivement  le nota intitulé: \n` + nota.title,
            userApprobation = confirm(msg);
        if (!userApprobation) return;

        const idxNota = this.arrNotas.indexOf(evt.detail.nota);
        this.arrNotas.splice(idxNota, 1);
        this.render();
        this.notesStorage.setJSON(this.arrNotas);
    }

}

const instance = new App();

export default instance;