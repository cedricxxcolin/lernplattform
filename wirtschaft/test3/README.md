# Marktstadt 3D – Das Spiel der Preisbildung

Ein offline-fähiges 3D-Lernspiel für **Wirtschaft und Recht (Sekundarstufe 2)** zum Thema **Angebot und Nachfrage**.

## Spielstart
1. Alle Dateien im gleichen Ordner belassen:
   - `index.html`
   - `style.css`
   - `script.js`
   - `three.min.js`
   - `README.md`
2. `index.html` per **Doppelklick** öffnen.
3. Im Startscreen auf **„Spiel starten“** klicken.
4. Danach in das Spielfeld klicken, um die Maussteuerung zu aktivieren.

> Das Spiel läuft vollständig lokal/offline, ohne CDN, npm oder Build-System.

## Steuerung
- **WASD** = Bewegen
- **Maus** = Umschauen
- **E** = Interagieren
- **ESC** = Dialogfenster schließen

## Lernziele
- Preisbildung als Ergebnis von **Angebot und Nachfrage** verstehen.
- Marktereignisse (z. B. Ernteausfall, Hype, Krise) und deren Wirkung auf Preise analysieren.
- Wirtschaftsentscheidungen treffen (kaufen/verkaufen) und Folgen in Geld/Punkten beobachten.
- Zentrale Begriffe wie Gleichgewicht, Knappheit und staatliche Eingriffe festigen.

## Spielmechanik
### Stadtbereiche und Level
1. **Bauernmarkt** (Level 1)
2. **Einkaufszone** (Level 2)
3. **Elektronikmarkt** (Level 3)
4. **Bank & Lagerhaus** (Level 4)
5. **Rathaus** (Level 5, Abschlusszone)

Neue Bereiche werden mit dem Quest-Fortschritt freigeschaltet.

### Handel
- Startkapital: **100 CHF**
- Produkte:
  - Äpfel
  - Brot
  - Kaffee
  - Smartphones
  - Fahrräder
- Käufe/Verkäufe beeinflussen Angebot und Nachfrage dynamisch.

### Preisbildung
Jedes Produkt hat:
- aktuellen Preis
- Nachfragewert
- Angebotswert

Vereinfachte Formel im Spiel:

`Preis = Basispreis × (Nachfrage / Angebot)`

Beispiele:
- Angebot sinkt → Preis steigt
- Nachfrage steigt → Preis steigt
- Angebot steigt → Preis sinkt

### Dynamische Ereignisse
Zufallsereignisse verändern Marktbedingungen:
- Ernteausfall
- Überproduktion
- Trend/Hype
- Krise
- Transportproblem
- Neue Technologie

### Quests und Quiz
- **10+ Aufträge** führen durch das Spiel und fördern handlungsorientiertes Lernen.
- **15 Multiple-Choice-Fragen** mit Sofort-Feedback und kurzer Erklärung.

## Technische Hinweise
- Struktur: einfache Trennung in HTML/CSS/JS.
- Keine Module, keine Imports, keine externen Abhängigkeiten.
- `three.min.js` ist lokal eingebunden.
