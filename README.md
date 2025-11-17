# **Blackjack AI Assistant — Opina + Monte-Carlo + RAG**

## **Présentation**

**Blackjack AI Assistant** est une application Web interactive combinant **simulation de blackjack**, **IA générative**, et **RAG (Retrieval-Augmented Generation)**.

Elle aide le joueur à analyser une main, comprendre la décision optimale à prendre, et étudier les probabilités associées, tout en illustrant l’usage moderne des modèles génératifs.

Ce projet a été développé dans le cadre d’un travail étudiant visant à manipuler des modèles IA, créer une interface utilisateur moderne, et mettre en œuvre de bonnes pratiques logicielles.

---

## **Objectifs du projet**

- Proposer un outil **fun**, **pédagogique** et **interactif** autour du blackjack.
- Exploiter :
    - un **LLM** pour expliquer les décisions (“opina”),
    - une **simulation Monte-Carlo** pour estimer l’EV (Expected Value),
    - un système **RAG** pour citer un fichier de connaissances chargé par l’utilisateur.
- Concevoir une interface moderne et agréable.
- Respecter les bonnes pratiques : modularité, commentaires, structure claire.

---

## **✨ Fonctionnalités principales**

 **Analyse de main**

- Sélection de tes deux cartes + carte visible du croupier.
- Calcul automatique :
    - Total de la main
    - Main Soft/Hard
    - Détection de paire et blackjack naturel
- Recommandation optimale selon la stratégie de base (S17, 3:2, no insurance).

### **Simulation Monte-Carlo**

- Simulation configurable (10 000 parties par défaut).
- Estimation :
    - Probabilité de **win / loss / push**
    - **EV (Expected Value)** moyenne
- Génération d’un **histogramme** via Chart.js.

### **IA générative — “opina”**

- Appel à un modèle LLM (OpenAI ou modèle local).
- Explication claire et contextuelle de la décision.
- Reformulation des résultats statistiques.

### **RAG intégré (Augmented Retrieval)**

- Chargement d’un fichier .txt, .md ou .json.
- Chunking + embeddings.
- Recherche par similarité cosinus.
- Citations automatiques [S1] [S2] … dans la réponse du LLM.

### **Interface utilisateur**

- Single-Page App HTML/CSS/JS.
- Look & feel casino (effet feutre, or, néons).
- Responsive, fluide, sans framework externe.

---

## **Architecture technique**

| **Partie** | **Technologie** |
| --- | --- |
| Front-end | HTML + CSS + JavaScript |
| Graphiques | Chart.js |
| IA Générative | API OpenAI (chat + embeddings) ou modèle open source |
| RAG | Embeddings + stockage en RAM dans le navigateur |
| Backend (optionnel) | Petit serveur Node.js (server.mjs) pour gérer les embeddings hors navigateur |

L’application peut fonctionner **100 % côté client** si l’utilisateur fournit sa clé API.
