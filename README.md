# Tour Planner

Re-upload: Repository wurde versehentlich geloescht beim Wechseln von Branches.

Eine Fullstack-Webanwendung zur Verwaltung von Touren und Reiseprotokollen.  
**Frontend:** Angular | **Backend:** Spring Boot | **Datenbank:** PostgreSQL

---

## Wireframe - Gesamtstruktur der Anwendung

```mermaid
graph TB
    subgraph App["Tour Planner Application"]
        direction TB
        Header["Tour Planner Header"]
        
        subgraph MainLayout["Main Layout"]
            direction LR
            
            subgraph LeftPanel["Linkes Panel - Tour Liste"]
                direction TB
                TourList["Tour 1<br/>Tour 2 (ausgewaehlt)<br/>Tour 3"]
                AddTourBtn["[+ Add Tour Button]"]
                TourList --> AddTourBtn
            end
            
            subgraph RightPanel["Rechtes Panel - Tour Details"]
                direction TB
                TourInfo["Name: Vienna City Tour<br/>Von: Stephansplatz<br/>Nach: Schoenbrunn<br/>Transport: Walking<br/>Distanz: 5.2 km<br/>Zeit: 1.5 h"]
                MapPlaceholder["Karten-Platzhalter<br/>(Map Placeholder)"]
                ActionButtons["[Edit] [Delete] [Save]"]
                LogSection["--- Tour Logs ---"]
                LogCard["Log 1:<br/>Datum: 2026-03-15<br/>Schwierigkeit: Medium<br/>Bewertung: 4/5<br/>[Edit Log] [Delete Log]"]
                AddLogBtn["[+ Add Log Button]"]
                
                TourInfo --> MapPlaceholder
                MapPlaceholder --> ActionButtons
                ActionButtons --> LogSection
                LogSection --> LogCard
                LogCard --> AddLogBtn
            end
            
            LeftPanel -.->|Auswahl| RightPanel
        end
        
        Header --> MainLayout
    end
    
    style Header fill:#4a6fa5,stroke:#333,stroke-width:2px,color:#fff
    style LeftPanel fill:#e8f4f8,stroke:#333,stroke-width:2px
    style RightPanel fill:#f0f8e8,stroke:#333,stroke-width:2px
    style TourList fill:#fff,stroke:#666
    style AddTourBtn fill:#6aa84f,stroke:#333,color:#fff
    style TourInfo fill:#fff,stroke:#666
    style MapPlaceholder fill:#ddd,stroke:#666
    style ActionButtons fill:#6aa84f,stroke:#333,color:#fff
    style LogCard fill:#fff,stroke:#666
    style AddLogBtn fill:#6aa84f,stroke:#333,color:#fff
```

---

## Architektur

```mermaid
graph LR
    A[Angular Frontend<br/>localhost:4200] -->|HTTP REST| B[Spring Boot Backend<br/>localhost:8080]
    B -->|JPA / Hibernate| C[(PostgreSQL<br/>Datenbank)]
```

---

## Datenmodell

```mermaid
erDiagram
    TOUR {
        number id PK
        string name
        string description
        string from
        string to
        string transportType
        number distance
        string estimatedTime
        string imageUrl
    }
    TOUR_LOG {
        number id PK
        string dateTime
        string comment
        number difficulty
        number totalDistance
        number totalTime
        number rating
        number tourId FK
    }
    TOUR ||--o{ TOUR_LOG : "hat viele"
```

---

## Benutzerablauf

```mermaid
flowchart TD
    A([App oeffnen]) --> B[Tour-Liste anzeigen]
    B --> C{Tour vorhanden?}
    C -- Nein --> D[Add Tour klicken]
    D --> E[Tour-Felder ausfuellen]
    E --> F[Save Changes]
    F --> B
    C -- Ja --> G[Tour auswaehlen]
    G --> H[Details und Karte anzeigen]
    H --> I{Aktion?}
    I -- Bearbeiten --> E
    I -- Log hinzufuegen --> J[Add Log]
    J --> K[Log-Felder ausfuellen]
    K --> L[Log speichern]
    L --> H
    I -- Loeschen --> M[Tour loeschen]
    M --> B
```

---

## REST API Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden

### Touren
- `GET /api/tours` - Alle Touren abrufen
- `POST /api/tours` - Neue Tour erstellen
- `PUT /api/tours/{id}` - Tour aktualisieren
- `DELETE /api/tours/{id}` - Tour loeschen

### Tour Logs
- `GET /api/tours/{id}/logs` - Alle Logs einer Tour
- `POST /api/tours/{id}/logs` - Neues Log erstellen
- `PUT /api/tour-logs/{logId}` - Log aktualisieren
- `DELETE /api/tour-logs/{logId}` - Log loeschen

---

## Setup und Starten

### Backend starten (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```

Windows:
```bash
cd backend
mvnw.cmd spring-boot:run
```

### Frontend starten (Angular)
```bash
cd frontend
npm install
ng serve
```

oder

```bash
cd frontend
npm install
npm start
```

Die Anwendung laeuft unter **http://localhost:4200**  
Das Backend laeuft unter **http://localhost:8080**

---

## Intermediate Hand-In Checkliste

### Erfuellte Anforderungen

**Must Haves**
- Angular als Frontend Framework verwendet
- MVVM Pattern fuer UI implementiert

**GUI Allgemein**
- Korrekte Datenbindung zwischen UI und View Model
- UI reagiert auf Fenstergroesse (responsive)
- Wiederverwendbare UI-Komponente definiert (TourLogCard)

**Touren**
- Erstellen, Bearbeiten, Loeschen von Touren
- Touren haben alle erforderlichen Attribute inkl. Bild
- Tour-Details zeigen alle Attribute und Karten-Platzhalter
- Eingabevalidierung verhindert Absturz bei falscher Eingabe

**Tour Logs**
- Erstellen, Bearbeiten, Loeschen von Tour Logs
- Logs haben alle erforderlichen Attribute
- Logs werden in Listenansicht mit allen Attributen angezeigt
- Eingabevalidierung implementiert

**Authentifizierung**
- Login und Registrierung mit JWT-Token
- Geschuetzte API-Endpunkte unter /api/**
- Oeffentliche Endpunkte unter /api/auth/**

---

## Projektstruktur

```
Team9/
├── backend/                 # Spring Boot Anwendung
│   └── src/main/java/at/fhtw/backend/
│       ├── BackendApplication.java
│       ├── config/
│       │   └── CorsConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── TourController.java
│       │   └── TourLogController.java
│       ├── model/
│       │   ├── Tour.java
│       │   ├── TourLog.java
│       │   └── User.java
│       ├── dto/
│       └── service/
│           ├── TourService.java
│           └── AuthService.java
│
└── frontend/                # Angular Anwendung
    └── src/app/
        ├── app.component.ts
        ├── app.component.html
        ├── tour.service.ts
        ├── auth.service.ts
        ├── models/
        │   ├── tour.model.ts
        │   ├── tour-log.model.ts
        │   └── auth.model.ts
        └── components/
            └── tour-log-card/
```

---

## Hinweis

Dieses Repository wurde neu hochgeladen, nachdem es beim Branch-Wechsel versehentlich geloescht wurde.

Dokumentation siehe DOCUMENTATION.md fuer detaillierte technische Informationen.

