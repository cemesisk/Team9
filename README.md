# TourPlanner - Projekt Dokumentation

Dieses Repository enthält die Planung und Umsetzung der TourPlanner App.

---

## 1. UML Diagrams

### Use Case Diagram
Das Diagramm zeigt die Interaktionen zwischen dem User und dem System sowie die Anbindung der Routen-API.

```mermaid
useCaseDiagram
    actor User
    actor "OpenRouteService API" as API <<External System>>

    package "Tour Planner System" {
        usecase "Self Register" as UC1
        usecase "Login" as UC2
        usecase "Manage Tours" as UC3
        usecase "Retrieve Route Data" as UC4
        usecase "Manage Tour Logs" as UC5
        usecase "Search Data" as UC6
        usecase "Import/Export" as UC7
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC5
    User --> UC6
    User --> UC7

    UC3 ..> UC4 : <<include>>
    UC4 -- API
