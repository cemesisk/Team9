# Tour Planner – Technische Dokumentation

> **Projekt:** Tour Planner  
> **Team:** Team 9 – FH Technikum Wien  
> **Stand:** April 2026  
> **Stack:** Angular 17 (Frontend) · Spring Boot 3 (Backend) · In-Memory Datenspeicher

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Systemarchitektur](#2-systemarchitektur)
3. [Projektstruktur](#3-projektstruktur)
4. [Datenmodell](#4-datenmodell)
5. [Backend – Spring Boot](#5-backend--spring-boot)
6. [Frontend – Angular](#6-frontend--angular)
7. [API-Dokumentation](#7-api-dokumentation)
8. [Datenmapping Frontend ↔ Backend](#8-datenmapping-frontend--backend)
9. [Validierung](#9-validierung)
10. [Setup & Starten](#10-setup--starten)
11. [Bekannte Einschränkungen & offene Punkte](#11-bekannte-einschränkungen--offene-punkte)

---

## 1. Projektübersicht

Der **Tour Planner** ist eine Fullstack-Webanwendung, mit der Nutzer Touren anlegen, verwalten und dokumentieren können. Zu jeder Tour können beliebig viele **Tour Logs** (Reiseprotokolle) erfasst werden.

### Kernfunktionen

| Funktion | Beschreibung |
|---|---|
| Tour anlegen | Neue Tour mit allen Pflichtfeldern erstellen |
| Tour bearbeiten | Name, Beschreibung, Strecke, Transport, Distanz etc. ändern |
| Tour löschen | Tour inkl. aller Logs entfernen |
| Log hinzufügen | Reiseprotokoll zu einer Tour hinzufügen |
| Log bearbeiten | Datum, Kommentar, Schwierigkeit, Distanz, Zeit, Bewertung ändern |
| Log löschen | Einzelnes Log einer Tour löschen |

---

## 2. Systemarchitektur

```mermaid
graph LR
    User([Benutzer]) -->|Browser| FE
    FE[Angular Frontend\nlocalhost:4200] -->|HTTP REST / JSON| BE
    BE[Spring Boot Backend\nlocalhost:8080] -->|In-Memory List| DB[(In-Memory\nDatenspeicher)]

    style FE fill:#4a6fa5,color:#fff
    style BE fill:#6aa84f,color:#fff
    style DB fill:#e69138,color:#fff
```

**Kommunikation:**
- Frontend → Backend: REST über `HttpClient` (Angular)
- CORS ist für `http://localhost:4200` konfiguriert
- Datenaustausch: JSON
- Kein persistenter Datenspeicher (In-Memory, Daten gehen beim Neustart verloren)

---

## 3. Projektstruktur

```
Team9/
├── backend/                        # Spring Boot Anwendung
│   └── src/main/java/at/fhtw/backend/
│       ├── BackendApplication.java         # Einstiegspunkt
│       ├── config/
│       │   └── CorsConfig.java             # CORS-Konfiguration
│       ├── controller/
│       │   ├── TourController.java         # REST-Endpunkte für Touren & Logs
│       │   └── TourLogController.java      # REST-Endpunkte für Logs direkt
│       ├── model/
│       │   ├── Tour.java                   # Tour-Datenklasse
│       │   └── TourLog.java                # TourLog-Datenklasse
│       └── service/
│           └── TourService.java            # Business-Logik & Datenhaltung
│
└── frontend/                       # Angular Anwendung
    └── src/app/
        ├── app.component.ts                # Haupt-Komponente (Controller)
        ├── app.component.html              # Haupt-Template (View)
        ├── app.component.scss              # Styles
        ├── app.routes.ts                   # Routing (aktuell leer)
        ├── tour.service.ts                 # HTTP-Service + Datenmapping
        ├── models/
        │   ├── tour.model.ts               # Tour Interface (Frontend)
        │   └── tour-log.model.ts           # TourLog Interface (Frontend)
        └── components/
            └── tour-log-card/
                └── tour-log-card.component.ts  # Log-Karten-Komponente
```

---

## 4. Datenmodell

```mermaid
erDiagram
    TOUR {
        Long id PK
        String name
        String description
        String fromLocation
        String toLocation
        String transportType
        double distance
        double estimatedTime
        String imageUrl
    }
    TOUR_LOG {
        Long id PK
        String date
        String comment
        String difficulty
        double totalDistance
        double totalTime
        int rating
    }
    TOUR ||--o{ TOUR_LOG : "hat viele"
```

### Tour – Feldübersicht

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `id` | `Long` | auto | Eindeutige ID (auto-increment) |
| `name` | `String` | ja | Name der Tour |
| `description` | `String` | – | Beschreibung |
| `fromLocation` | `String` | ja | Startort |
| `toLocation` | `String` | ja | Zielort |
| `transportType` | `String` | – | z. B. `Walking`, `Bicycle`, `Car` |
| `distance` | `double` | ja (>= 0) | Distanz in km |
| `estimatedTime` | `double` | ja | Geschätzte Zeit in Stunden |
| `imageUrl` | `String` | – | URL zum Tourenbild |
| `logs` | `List<TourLog>` | – | Liste der Reiseprotokolle |

### TourLog – Feldübersicht

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `id` | `Long` | auto | Eindeutige ID |
| `date` | `String` | – | Datum (ISO: `YYYY-MM-DD`) |
| `comment` | `String` | ja | Kommentar zum Erlebnis |
| `difficulty` | `String` | ja | `Very Easy` / `Easy` / `Medium` / `Hard` / `Very Hard` |
| `totalDistance` | `double` | ja (>= 0) | Tatsächlich zurückgelegte Distanz in km |
| `totalTime` | `double` | ja (>= 0) | Tatsächlich benötigte Zeit in Stunden |
| `rating` | `int` | ja (1–5) | Bewertung der Tour |

---

## 5. Backend – Spring Boot

### 5.1 Einstiegspunkt

`BackendApplication.java` – Standard Spring Boot Main-Klasse, startet den Tomcat-Server auf **Port 8080**.

### 5.2 CORS-Konfiguration

`CorsConfig.java` erlaubt Anfragen vom Angular-Frontend:

```java
registry.addMapping("/api/**")
    .allowedOrigins("http://localhost:4200")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
```

### 5.3 TourService – Business-Logik

Der `TourService` ist der zentrale Datenspeicher. Daten werden **im RAM** gehalten (`List<Tour>`). Beim Start werden via `@PostConstruct` zwei Beispieltouren angelegt:

| Tour | Von → Nach | Transport |
|---|---|---|
| Vienna City Tour | Stephansplatz → Schönbrunn | Walking |
| Danube Bike Ride | Donauinsel → Klosterneuburg | Bicycle |

**Methoden:**

| Methode | Beschreibung |
|---|---|
| `getAllTours()` | Alle Touren zurückgeben |
| `getTourById(id)` | Tour per ID suchen |
| `createTour(tour)` | Tour anlegen, ID vergeben |
| `updateTour(id, tour)` | Tour-Felder aktualisieren (Logs bleiben erhalten) |
| `deleteTour(id)` | Tour aus Liste entfernen |
| `getLogsByTourId(tourId)` | Alle Logs einer Tour |
| `addLogToTour(tourId, log)` | Log zu Tour hinzufügen |
| `updateLog(logId, log)` | Log-Felder aktualisieren |
| `deleteLog(logId)` | Log aus Tour entfernen |

### 5.4 TourController

`@RestController` unter `/api/tours`. Delegiert alle Aufrufe an den `TourService`.

---

## 6. Frontend – Angular

### 6.1 AppComponent

Die `AppComponent` ist die einzige Seite der Anwendung (Single-Page). Sie enthält:

- **Linkes Panel:** Tour-Liste + „Add Tour"-Button
- **Rechtes Panel:** Tour-Details, Edit-Formular, Log-Liste

**Wichtige Methoden:**

| Methode | Beschreibung |
|---|---|
| `ngOnInit()` | Touren beim Start laden |
| `loadTours()` | Alle Touren vom Backend abrufen, `selectedTour` aktualisieren |
| `addTour()` | Neue Tour mit Standardwerten anlegen |
| `saveTour()` | Aktuell ausgewählte Tour speichern (nach Validierung) |
| `deleteSelectedTour()` | Ausgewählte Tour löschen |
| `addLog()` | Neues Log zur aktuellen Tour hinzufügen |
| `saveLog(log)` | Log speichern (nach Validierung) |
| `deleteLog(logId)` | Log löschen |

### 6.2 TourService (Angular)

Verantwortlich für:
1. **HTTP-Kommunikation** mit dem Backend
2. **Datenmapping** zwischen Frontend- und Backend-Format

**Base URLs:**
```typescript
private readonly baseUrl        = 'http://localhost:8080/api/tours';
private readonly tourLogBaseUrl = 'http://localhost:8080/api/tour-logs';
```

### 6.3 TourLogCard-Komponente

Eigenständige Komponente zur Anzeige und Bearbeitung eines einzelnen Logs.

**Inputs/Outputs:**
- `@Input() log: TourLog` – das anzuzeigende Log
- `@Output() deleteRequested` – Event beim Klick auf „Löschen"
- `@Output() saveRequested` – Event beim Klick auf „Speichern"

---

## 7. API-Dokumentation

### Tours

| Methode | Endpoint | Beschreibung | Response |
|---|---|---|---|
| `GET` | `/api/tours` | Alle Touren abrufen | `200 OK` – `Tour[]` |
| `GET` | `/api/tours/{id}` | Tour per ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/tours` | Neue Tour erstellen | `200 OK` – `Tour` |
| `PUT` | `/api/tours/{id}` | Tour aktualisieren | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/tours/{id}` | Tour löschen | `204 No Content` / `404 Not Found` |

### Tour Logs

| Methode | Endpoint | Beschreibung | Response |
|---|---|---|---|
| `GET` | `/api/tours/{id}/logs` | Alle Logs einer Tour | `200 OK` – `TourLog[]` |
| `POST` | `/api/tours/{id}/logs` | Neues Log anlegen | `200 OK` – `TourLog` |
| `PUT` | `/api/tour-logs/{logId}` | Log aktualisieren | `200 OK` – `TourLog` |
| `DELETE` | `/api/tour-logs/{logId}` | Log löschen | `204 No Content` |

### Beispiel – Tour anlegen (POST `/api/tours`)

**Request Body:**
```json
{
  "name": "Wien Radtour",
  "description": "Schöne Radtour durch Wien",
  "fromLocation": "Praterstern",
  "toLocation": "Schönbrunn",
  "transportType": "Bicycle",
  "distance": 12.5,
  "estimatedTime": 1.5,
  "imageUrl": "https://example.com/wien.jpg",
  "logs": []
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Wien Radtour",
  "fromLocation": "Praterstern",
  "toLocation": "Schönbrunn",
  "transportType": "Bicycle",
  "distance": 12.5,
  "estimatedTime": 1.5,
  "logs": []
}
```

---

## 8. Datenmapping Frontend ↔ Backend

Da Frontend und Backend unterschiedliche Feldnamen und -typen verwenden, führt der `TourService` eine Konvertierung durch:

### Tour-Mapping

| Frontend (`Tour`) | Backend (`BackendTour`) | Unterschied |
|---|---|---|
| `from` | `fromLocation` | Umbenennung |
| `to` | `toLocation` | Umbenennung |
| `estimatedTime: string` | `estimatedTime: number` | String `"3h 10min"` ↔ Dezimalzahl `3.167` |

### TourLog-Mapping

| Frontend (`TourLog`) | Backend (`BackendTourLog`) | Unterschied |
|---|---|---|
| `dateTime: string` | `date: string` | Enthält Zeit (ISO) ↔ nur Datum |
| `difficulty: number` | `difficulty: string` | `3` ↔ `"Medium"` |
| `totalTime: number` (Minuten) | `totalTime: number` (Stunden) | Umrechnung × 60 |

### Schwierigkeits-Mapping

| Zahl (Frontend) | Text (Backend) |
|---|---|
| 1 | `Very Easy` |
| 2 | `Easy` |
| 3 | `Medium` |
| 4 | `Hard` |
| 5 | `Very Hard` |

---

## 9. Validierung

Validierung findet ausschließlich im **Frontend** statt. Felder mit Fehler werden rot markiert.

### Tour-Validierung

| Feld | Regel | Fehlermeldung |
|---|---|---|
| `name` | Nicht leer | *Name must not be empty* |
| `from` | Nicht leer | *Start location must not be empty* |
| `to` | Nicht leer | *Destination must not be empty* |
| `distance` | `>= 0` | *Distance must be 0 or greater* |
| `estimatedTime` | Nicht leer | *Estimated time must not be empty* |

### Log-Validierung

| Feld | Regel |
|---|---|
| `comment` | Nicht leer |
| `difficulty` | `>= 0` |
| `totalDistance` | `>= 0` |
| `totalTime` | `>= 0` |
| `rating` | `1 – 5` |

---

## 10. Setup & Starten

### Voraussetzungen

| Tool | Version |
|---|---|
| Java | 17+ |
| Maven | 3.8+ (oder `./mvnw`) |
| Node.js | 18+ |
| Angular CLI | 17+ |

### Backend starten

```bash
cd backend
./mvnw spring-boot:run
```

Backend läuft auf → **http://localhost:8080**

### Frontend starten

```bash
cd frontend
npm install
ng serve
```

Frontend läuft auf → **http://localhost:4200**

### Reihenfolge

```mermaid
sequenceDiagram
    participant Dev as Entwickler
    participant BE as Spring Boot
    participant FE as Angular

    Dev->>BE: ./mvnw spring-boot:run
    BE-->>Dev: Läuft auf :8080
    Dev->>FE: ng serve
    FE-->>Dev: Läuft auf :4200
    Dev->>FE: Browser öffnen
    FE->>BE: GET /api/tours
    BE-->>FE: Tour-Liste (JSON)
```

---

## 11. Bekannte Einschränkungen & offene Punkte

| # | Thema | Beschreibung |
|---|---|---|
| 1 | **Kein persistenter Speicher** | Daten gehen beim Backend-Neustart verloren. Noch keine Datenbank (z. B. PostgreSQL) angebunden. |
| 2 | **Kein Routing** | `app.routes.ts` ist leer – alle Views befinden sich in einer einzigen Komponente. |
| 3 | **Keine Kartenintegration** | Der Karten-Platzhalter (`Map placeholder`) ist noch nicht mit OpenLayers / Leaflet befüllt. |
| 4 | **Keine Authentifizierung** | Kein Login / keine Benutzerverwaltung vorhanden. |
| 5 | **Keine Backend-Validierung** | Validierung findet nur im Frontend statt; das Backend nimmt alle Eingaben ungeprüft an. |
| 6 | **CORS nur für localhost** | Produktivbetrieb erfordert angepasste CORS-Konfiguration. |
