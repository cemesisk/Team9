# TourPlanner - Projekt Dokumentation

Dieses Repository enthält die Planung und Umsetzung der TourPlanner App.

---

## 1. UML Diagrams

### Use Case Diagram
Das Diagramm zeigt die Interaktionen zwischen dem User und dem System sowie die Anbindung der Routen-API.

```mermaid
graph LR
    User((User))
    API[OpenRouteService API]

    subgraph "Tour Planner System"
        UC1(Self Register)
        UC2(Login)
        UC3(Manage Tours)
        UC4(Retrieve Route Data)
        UC5(Manage Tour Logs)
        UC6(Search Data)
        UC7(Import/Export)
    end

    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC5
    User --- UC6
    User --- UC7

    UC3 -.->|include| UC4
    UC4 --- API
