<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>NotaBene</title>
</head>
<body>
    <div class="title-bar">
        <div class="logo">NotaBene</div>
        <button type="button" class="btn" id="btn-board-clear">Tout Effacer</button>
    </div>

    <div class="main-zone">
        <div class="tool-bar">
            <div class="form-title">Nouveau</div>
            <form action="" method="post">
                <div class="form-row">
                    <label for="new-nota-title">Titre</label>
                    <input type="text" id="new-nota-title" class="form-control">
                </div>

                <div class="form-row">
                    <label for="new-nota-content">Contenu</label>
                    <textarea id="new-nota-content" class="form-control"></textarea>
                </div>

                <div>
                    <button type="submit" class="btn">Ajouter</button>
                </div>
            </form>
        </div>

        <div class="board-zone">
            <ul id="board" class="board-list"></ul>
        </div>
    </div>
</body>
</html>