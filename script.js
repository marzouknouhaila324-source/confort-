
const temperatureInput = document.getElementById("temperature");
const humiditeInput = document.getElementById("humidite");

const temperatureRange = document.getElementById("temperature-range");
const humiditeRange = document.getElementById("humidite-range");

const evaluerButton = document.getElementById("evaluer");

function limiter(valeur, min, max) {
    return Math.min(Math.max(valeur, min), max);
}

// Fonctions d'appartenance de la température
function temperatureFroide(t) {
    if (t <= 10) return 1;
    if (t >= 20) return 0;
    return (20 - t) / 10;
}

function temperatureModeree(t) {
    if (t <= 15 || t >= 30) return 0;
    if (t <= 22.5) return (t - 15) / 7.5;
    return (30 - t) / 7.5;
}

function temperatureChaude(t) {
    if (t <= 25) return 0;
    if (t >= 35) return 1;
    return (t - 25) / 10;
}

// Fonctions d'appartenance de l'humidité
function humiditeFaible(h) {
    if (h <= 20) return 1;
    if (h >= 40) return 0;
    return (40 - h) / 20;
}

function humiditeMoyenne(h) {
    if (h <= 30 || h >= 70) return 0;
    if (h <= 50) return (h - 30) / 20;
    return (70 - h) / 20;
}

function humiditeElevee(h) {
    if (h <= 60) return 0;
    if (h >= 80) return 1;
    return (h - 60) / 20;
}

// Évaluation par les règles floues
function evaluerConfort(t, h) {
    const froide = temperatureFroide(t);
    const moderee = temperatureModeree(t);
    const chaude = temperatureChaude(t);

    const faible = humiditeFaible(h);
    const moyenne = humiditeMoyenne(h);
    const elevee = humiditeElevee(h);

    // Opérateur ET : minimum
    const regles = [
        { degre: Math.min(froide, faible), resultat: "mauvais" },
        { degre: Math.min(froide, moyenne), resultat: "mauvais" },
        { degre: Math.min(froide, elevee), resultat: "mauvais" },

        { degre: Math.min(moderee, faible), resultat: "moyen" },
        { degre: Math.min(moderee, moyenne), resultat: "bon" },
        { degre: Math.min(moderee, elevee), resultat: "moyen" },

        { degre: Math.min(chaude, faible), resultat: "mauvais" },
        { degre: Math.min(chaude, moyenne), resultat: "mauvais" },
        { degre: Math.min(chaude, elevee), resultat: "mauvais" }
    ];

    // Agrégation : maximum pour chaque catégorie
    const mauvais = Math.max(
        0,
        ...regles
            .filter(r => r.resultat === "mauvais")
            .map(r => r.degre)
    );

    const moyen = Math.max(
        0,
        ...regles
            .filter(r => r.resultat === "moyen")
            .map(r => r.degre)
    );

    const bon = Math.max(
        0,
        ...regles
            .filter(r => r.resultat === "bon")
            .map(r => r.degre)
    );

    const somme = mauvais + moyen + bon;

    // Valeurs représentatives : mauvais = 20, moyen = 50, bon = 100
    let score = 20;

    if (somme > 0) {
        score = (
            mauvais * 20 +
            moyen * 50 +
            bon * 100
        ) / somme;
    }

    return {
        score: Math.round(score),
        mauvais,
        moyen,
        bon
    };
}

function afficherPourcentage(valeur) {
    return Math.round(valeur * 100) + " %";
}

function afficherResultat() {
    const temperature = limiter(
        Number(temperatureInput.value),
        0,
        45
    );

    const humidite = limiter(
        Number(humiditeInput.value),
        0,
        100
    );

    if (
        temperatureInput.value.trim() === "" ||
        humiditeInput.value.trim() === "" ||
        !Number.isFinite(temperature) ||
        !Number.isFinite(humidite)
    ) {
        alert("Veuillez saisir une température et une humidité valides.");
        return;
    }

    temperatureInput.value = temperature;
    humiditeInput.value = humidite;
    temperatureRange.value = temperature;
    humiditeRange.value = humidite;

    const resultat = evaluerConfort(temperature, humidite);
    const score = resultat.score;

    document.getElementById("score").textContent = score;

    document.getElementById("score-circle").style.background =
        `conic-gradient(#26785f ${score * 3.6}deg, #e8eee9 0deg)`;

    document.getElementById("bad-value").textContent =
        afficherPourcentage(resultat.mauvais);

    document.getElementById("medium-value").textContent =
        afficherPourcentage(resultat.moyen);

    document.getElementById("good-value").textContent =
        afficherPourcentage(resultat.bon);

    document.getElementById("bad-bar").style.width =
        (resultat.mauvais * 100) + "%";

    document.getElementById("medium-bar").style.width =
        (resultat.moyen * 100) + "%";

    document.getElementById("good-bar").style.width =
        (resultat.bon * 100) + "%";

    const comfortLabel = document.getElementById("comfort-label");
    const description = document.getElementById("result-description");
    const advice = document.getElementById("advice");
    const houseTitle = document.getElementById("house-title");
    const houseMessage = document.getElementById("house-message");

    if (score < 40) {
        comfortLabel.textContent = "Confort insuffisant";
        description.textContent =
            "Les conditions thermiques sont peu favorables.";
        advice.textContent =
            "Essayez d'ajuster la température et d'améliorer la ventilation.";
        houseTitle.textContent = "Un environnement à améliorer";
        houseMessage.textContent =
            "Les conditions actuelles peuvent réduire la sensation de confort.";
    } else if (score < 75) {
        comfortLabel.textContent = "Confort moyen";
        description.textContent =
            "Les conditions peuvent être améliorées.";
        advice.textContent =
            "Ajustez progressivement la température ou l'humidité pour améliorer le confort.";
        houseTitle.textContent = "Un confort perfectible";
        houseMessage.textContent =
            "Quelques ajustements de la température et de l'humidité peuvent rendre la pièce plus agréable.";
    } else {
        comfortLabel.textContent = "Bon confort";
        description.textContent =
            "Les conditions sont globalement favorables.";
        advice.textContent =
            "Maintenez ces conditions pour préserver un environnement agréable.";
        houseTitle.textContent = "Un environnement confortable";
        houseMessage.textContent =
            "Une température agréable et une humidité équilibrée favorisent un quotidien plus sain.";
    }
}

// Synchronisation des champs numériques et des curseurs
temperatureRange.addEventListener("input", () => {
    temperatureInput.value = temperatureRange.value;
});

humiditeRange.addEventListener("input", () => {
    humiditeInput.value = humiditeRange.value;
});

temperatureInput.addEventListener("input", () => {
    const valeur = Number(temperatureInput.value);

    if (temperatureInput.value !== "" && Number.isFinite(valeur)) {
        temperatureRange.value = limiter(valeur, 0, 45);
    }
});

humiditeInput.addEventListener("input", () => {
    const valeur = Number(humiditeInput.value);

    if (humiditeInput.value !== "" && Number.isFinite(valeur)) {
        humiditeRange.value = limiter(valeur, 0, 100);
    }
});

evaluerButton.addEventListener("click", afficherResultat);

// Afficher un premier résultat au chargement
afficherResultat();