# Product Requirement Document

## 1. Produktübersicht

**Produktname:** PlanYMeal
**Beschreibung:** Ein webbasierter Essensplaner mit Wochenplan-Funktionalität, Menüverwaltung und Zutatenliste-Generierung.

## 2. Technische Architektur

### 2.1 Backend
- **Framework:** Next.js mit TypeScript
- **Datenbank:** SQLite (Entwicklung) / PostgreSQL (Produktion)
- **ORM:** Prisma
- **Authentifizierung:** NextAuth.js mit GitHub OAuth

### 2.2 Frontend
- **Framework:** React mit TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Font Awesome
- **Responsive Design:** Mobile-first Ansatz

### 2.3 API
- **RESTful API** mit OpenAPI 3.0 Spezifikation
- **CORS-Unterstützung**
- **JSON-basierte Kommunikation**

## 3. Kernfunktionen

### 3.1 Menüverwaltung
- **Menü erstellen:** Neue Gerichte mit Namen, Bild, Beschreibung und Zutaten
- **Menü bearbeiten:** Bestehende Menüs modifizieren
- **Menü löschen:** Entfernung von Menüs mit Bestätigung
- **Menü-Bewertung:** 5-Sterne-Bewertungssystem
- **Zutaten-Management:** 
  - Zutat hinzufügen/entfernen
  - Mengenangaben (g, ml, Stück)

### 3.2 Wochenplan-Funktionalität
- **Kalender-Ansicht:** 7-Tage-Wochenplan beginnend mit dem aktuellen Tag

### 3.3 Zutatenliste-Generierung
- **Automatische Berechnung:** Summierung aller Zutaten des 7-Tage-Wochenplan beginnend mit dem aktuellen Tag
- **Konsolidierung:** Gleiche Zutaten werden zusammengefasst
- **Sortierung:** Alphabetische Sortierung der Zutaten
- **Export-Funktion:** Übersichtliche Darstellung der Einkaufsliste
- **Speichern:** 
  - Generierte Zutatenliste kann gespeichert werden
  - Jede Zutat kann per Checkbox abgehakt werden
  - Abgehakte Zutaten werden durchgestrichen angezeigt
  - Checkbox wodurch abgehakte Zutaten nicht angezeigt werden

### 3.4 Mehrsprachigkeit
- **Unterstützte Sprachen:** Deutsch, Englisch
- **Dynamische Übersetzung:** Alle UI-Elemente übersetzt
- **Standardsprache:** Sprache des Browsers als Standard nehmen
- **Sprachauswahl:** Benutzer kann Sprache wechseln
- **Lokalisierung:** Datums- und Zahlenformatierung

## 4. Benutzeroberfläche

### 4.1 Layout-Struktur
- **Header:** Sprachauswahl und Logout-Button
- **Hauptbereich:** Zwei-Spalten-Layout
  - **Linke Spalte:** Wochenplan-Kalender
  - **Rechte Spalte:** Menüvorschläge

### 4.2 Wochenplan-Kalender
- **Kalender-Header:** 
  - Wochenplan-Titel
  - Navigation (vor/zurück)
  - Zutatenliste-Button
- **Tages-Container:** 7 Tage in Grid-Layout
- **Tages-Karten:** 
  - Datum und Wochentag
  - Drop-Zone für Menüs
  - Geplante Menüs mit Lösch-Option

### 4.3 Menüvorschläge
- **Header:** Titel und "Neues Menü"-Button
- **Menü-Liste:** Scrollbare Liste aller Menüs
- **Pagination:** Seitenweise Anzeige (10 Menüs pro Seite)
- **Menü-Karten:** 
  - Menüname
  - Bild
  - Beschreibung
  - Bewertungssterne

### 4.4 Dialoge
- **Menü-Dialog:** 
  - Formular für Menü-Erstellung/Bearbeitung
  - Dynamische Zutatenliste
  - Bewertungs-Sterne
  - Speichern/Abbrechen-Buttons
- **Zutatenliste-Dialog:** 
  - Übersicht aller Zutaten der Woche
  - Sortierte Darstellung
  - Schließen-Button
  - Speichern-Button

## 5. Datenmodell

### 5.1 Menü (MenuItems)
```typescript
interface MenuItem {
    id: number;
    userId: string;
    name: string;
    image: string;
    description: string;
    ingredients: Ingredient[];
    rating?: number;
}
```

### 5.2 Zutat (Ingredients)
```typescript
interface Ingredient {
    id: number;
    userId: string;
    name: string;
    amount: number;
    unit: 'g' | 'ml' | 'Stück';
}
```

### 5.3 Wochenplan (WeekPlan)
```typescript
interface DayPlan {
    id: number;
    userId: string;
    date: string;
    menuItem: MenuItem | null;
}
```

## 6. API-Endpunkte

### 6.1 Menüverwaltung
- `GET /api/menu-items` - Alle Menüs abrufen (mit Pagination)
- `GET /api/menu-items/:id` - Einzelnes Menü abrufen
- `POST /api/menu-items` - Neues Menü erstellen
- `PUT /api/menu-items/:id` - Menü aktualisieren
- `DELETE /api/menu-items/:id` - Menü löschen

### 6.2 Wochenplan
- `GET /api/week-plan` - Wochenplan abrufen
- `POST /api/week-plan/day` - Menü einem Tag zuordnen
- `DELETE /api/week-plan/day/:date` - Menü von Tag entfernen

## 7. Benutzerinteraktionen

### 7.1 Drag & Drop
- **Menü zu Tag:** Menü von rechter Liste in Kalender-Tag ziehen
- **Menü verschieben:** Geplantes Menü zwischen Tagen verschieben
- **Visuelle Rückmeldung:** Hover-Effekte und Drop-Zonen

### 7.2 Klick-Interaktionen
- **Menü bearbeiten:** Einfacher Klick auf Menü öffnet Bearbeitungs-Dialog
- **Menü löschen:** Klick auf Lösch-Icon mit Bestätigung
- **Schnellzuordnung:** Doppelklick auf Menü ordnet es dem nächsten freien Tag zu

### 7.3 Navigation
- **Wochen-Navigation:** Pfeil-Buttons für Wochenwechsel
- **Pagination:** Seitenweise Navigation durch Menüliste
- **Sprachwechsel:** Dropdown für Sprachauswahl

## 8. Sicherheitsfeatures

### 8.1 Autorisierung
- **Benutzer-Isolation:** Jeder Benutzer sieht nur seine eigenen Daten
- **API-Schutz:** Alle Endpunkte außer Auth erfordern gültigen Token
- **Input-Validierung:** Server-seitige Validierung aller Eingaben

## 9. Performance-Optimierungen

### 9.1 Frontend
- **Lazy Loading:** Menüs werden seitenweise geladen
- **Event Delegation:** Effiziente Event-Behandlung
- **CSS-Optimierung:** Minimierte Stylesheets

### 9.2 Backend
- **Datenbank-Indizes:** Optimierte Abfragen
- **Connection Pooling:** Effiziente Datenbankverbindungen

## 10. Deployment & Infrastruktur

### 10.1 Entwicklung
- **SQLite:** Lokale Entwicklung mit SQLite-Datenbank
- **Hot Reload:** Automatisches Neuladen bei Änderungen
- **Debug-Modus:** Detaillierte Logging-Ausgaben

### 10.2 Produktion
- **PostgreSQL:** Produktions-Datenbank
- **Environment Variables:** Konfiguration über Umgebungsvariablen
- **Docker-Support:** Containerisierte Bereitstellung

## 11. Qualitätssicherung

### 11.1 Code-Qualität
- **TypeScript:** Typsicherheit im Backend
- **ESLint:** Code-Style-Konformität
- **Modulare Architektur:** Wiederverwendbare Komponenten

### 11.2 Benutzerfreundlichkeit
- **Responsive Design:** Mobile und Desktop optimiert
- **Intuitive Bedienung:** Klare Benutzerführung
- **Fehlerbehandlung:** Benutzerfreundliche Fehlermeldungen

## 12. Zukünftige Erweiterungen

### 12.1 Geplante Features
- **Rezept-Sharing:** Teilen von Menüs zwischen Benutzern

### 12.2 Monetarisierung
- **Stripe-Integration:** Zahlungsabwicklung für Premium-Features
- **Freemium-Modell:** Basis-Features kostenlos, Premium-Features kostenpflichtig

## 13. Technische Anforderungen

### 13.1 Systemanforderungen
- **Node.js:** Version 22 oder höher
- **NPM:** Für Paketverwaltung
- **Browser:** Moderne Browser mit ES6+ Support

## 14. Dokumentation

### 14.1 API-Dokumentation
- **OpenAPI 3.0:** Vollständige API-Spezifikation
- **Swagger UI:** Interaktive API-Dokumentation
- **Code-Kommentare:** Inline-Dokumentation

### 14.2 Benutzer-Dokumentation
- **README:** Installations- und Nutzungsanleitung
- **Inline-Hilfe:** Tooltips und Hilfetexte in der UI
