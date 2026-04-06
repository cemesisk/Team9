# 🗺️ Tour Planner

Eine Fullstack-Webanwendung zur Verwaltung von Touren und Reiseprotokollen.  
**Frontend:** Angular · **Backend:** Spring Boot · **Datenbank:** PostgreSQL

---

## 🏗️ Architektur

```mermaid
graph LR
    A[🌐 Angular Frontend<br/>localhost:4200] -->|HTTP REST| B[☕ Spring Boot Backend<br/>localhost:8080]
    B -->|JPA / Hibernate| C[(🗄️ PostgreSQL<br/>Datenbank)]
```

---

## 🗃️ Datenmodell

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

## 🔄 User Flow

```mermaid
flowchart TD
    A([🚀 App öffnen]) --> B[Tour-Liste anzeigen]
    B --> C{Tour vorhanden?}
    C -- Nein --> D[➕ Add Tour klicken]
    D --> E[Tour-Felder ausfüllen]
    E --> F[💾 Save Changes]
    F --> B
    C -- Ja --> G[Tour auswählen]
    G --> H[Details & Karte anzeigen]
    H --> I{Aktion?}
    I -- Bearbeiten --> E
    I -- Log hinzufügen --> J[➕ Add Log]
    J --> K[Log-Felder ausfüllen]
    K --> L[💾 Log speichern]
    L --> H
    I -- Löschen --> M[🗑️ Tour löschen]
    M --> B
```

---

## 🔌 REST API Endpunkte

```mermaid
graph TD
    subgraph Tours [📦 /api/tours]
        T1[GET /api/tours]
        T2[POST /api/tours]
        T3[PUT /api/tours/:id]
        T4[DELETE /api/tours/:id]
    end
    subgraph Logs [📝 /api/tours/:id/logs]
        L1[GET /api/tours/:id/logs]
        L2[POST /api/tours/:id/logs]
        L3[PUT /api/tours/:id/logs/:logId]
        L4[DELETE /api/tours/:id/logs/:logId]
    end
```

---

## 🖥️ UI-Struktur

```mermaid
graph TD
    App[🗺️ Tour Planner App]
    App --> Header[Header]
    App --> Layout[Main Layout]
    Layout --> Left[Linkes Panel<br/>Tour-Liste]
    Layout --> Right[Rechtes Panel]
    Left --> TourList[Tour-Einträge]
    Left --> AddTourBtn[➕ Add Tour Button]
    Right --> NoTour[Kein Tour gewählt<br/>Leerzustand]
    Right --> TourSelected[Tour ausgewählt]
    TourSelected --> Details[Tour Details<br/>Bild · Felder · Karte]
    TourSelected --> EditForm[Edit-Formular<br/>mit Validierung]
    TourSelected --> LogList[Tour Logs]
    LogList --> LogCard[TourLogCard-Komponente<br/>Anzeige + Bearbeitung]
```

---

## 🚀 Setup & Starten

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```

App läuft unter **http://localhost:4200**
