# PDF Stamper Dokumentation

*In anderen Sprachen lesen: [English](README.md)*

## Überblick

PDF Stamper ist eine Webanwendung, die es Benutzern ermöglicht, PDF-Dateien hochzuladen, Vorschaubilder der ersten Seite anzuzeigen, Textstempel auf den Dokumenten anzubringen und die verarbeiteten Dateien herunterzuladen oder zu löschen. Die Anwendung besteht aus einem Spring Boot Backend und einem React Frontend.

## Systemarchitektur

Die Anwendung folgt einer Client-Server-Architektur:

1. **Backend**: Java mit Spring Boot
2. **Frontend**: React.js
3. **Kommunikation**: RESTful API-Endpunkte

```
+--------------------+       +----------------------+
|                    |       |                      |
|  React Frontend    | <---> |  Spring Boot Backend |
|                    |       |                      |
+--------------------+       +----------------------+
```

## Backend-Implementierung

### Kernkomponenten

Das Backend wurde mit Spring Boot entwickelt und ist in folgende Komponenten organisiert:

#### Konfiguration

- **FileStorageProperties.java**: Konfiguriert Dateispeicherorte und -eigenschaften.

#### Controller

- **FileController.java**: Stellt REST-Endpunkte für Dateioperationen bereit:
  - `POST /api/files/upload`: Hochladen einer PDF-Datei
  - `GET /api/files/list`: Auflisten aller hochgeladenen Dateien
  - `GET /api/files/thumbnail/{fileName}`: Abrufen des JPEG-Vorschaubilds der ersten Seite einer PDF
  - `POST /api/files/stamp/{fileName}`: Anbringen eines Textstempels auf einer PDF
  - `GET /api/files/download/{fileName}`: Herunterladen einer PDF-Datei
  - `DELETE /api/files/{fileName}`: Löschen einer PDF-Datei

#### Ausnahmen

- **FileNotFoundException.java**: Benutzerdefinierte Ausnahme für den Fall, dass eine angeforderte Datei nicht existiert
- **FileStorageException.java**: Benutzerdefinierte Ausnahme für Probleme mit dem Dateispeicher

#### Modelle

- **FileResponse.java**: Antwortmodell mit Dateimetadaten
- **StampRequest.java**: Modell für Stempelanfrageparameter (Datum, Name, Kommentar)

#### Services

- **FileStorageService.java**: Verwaltet Dateispeicheroperationen (Speichern, Abrufen, Löschen)
- **PDFService.java**: Verarbeitet PDF-Dateien (Generierung von Vorschaubildern, Stempeln)

### Hauptfunktionen

1. **Datei-Upload**: Speichert hochgeladene PDF-Dateien sicher.
2. **Vorschaubild-Generierung**: Konvertiert die erste Seite einer PDF in ein JPEG-Bild.
3. **PDF-Stempelung**: Bringt Textstempel (Datum, Name, Kommentar) an einer festen Position auf PDFs an.
4. **Dateiverwaltung**: Listet, lädt herunter und löscht Dateien.

### Verzeichnisstruktur

```
uploads/
├── thumbnails/    # Speichert JPEG-Vorschaubilder
└── [PDF files]    # Speichert Original- und gestempelte PDFs
```

## Frontend-Implementierung

### Komponenten

Das React-Frontend besteht aus diesen Hauptkomponenten:

1. **FileUpload.js**: Verwaltet die Dateiauswahl und das Hochladen zum Backend.
2. **FileList.js**: Zeigt eine Liste aller hochgeladenen PDF-Dateien an.
3. **PDFPreview.js**: Zeigt das Vorschaubild der ausgewählten PDF an.
4. **StampForm.js**: Bietet Eingabefelder für Stempelinhalte (Datum, Name, Kommentar).

### Services

- **FileService.js**: Verwaltet die API-Kommunikation mit dem Backend.

### Benutzeroberflächen-Ablauf

1. Der Benutzer lädt eine PDF-Datei über die Upload-Komponente hoch.
2. Die Datei erscheint in der Dateiliste.
3. Wenn eine Datei ausgewählt wird, wird ihr Vorschaubild angezeigt.
4. Der Benutzer gibt Stempelinformationen ein und klickt auf die Stempeltaste.
5. Das Vorschaubild wird aktualisiert, um die gestempelte Version anzuzeigen.
6. Der Benutzer kann die gestempelte PDF herunterladen oder Dateien löschen.

## API-Endpunkte

| Methode | Endpunkt                       | Beschreibung                            | Request Body/Parameter              | Antwort                                |
|---------|--------------------------------|----------------------------------------|-------------------------------------|----------------------------------------|
| POST    | /api/files/upload              | Neue PDF-Datei hochladen                | form-data mit "file" Schlüssel      | FileResponse JSON                       |
| GET     | /api/files/list                | Liste aller hochgeladenen Dateien abrufen | -                                 | Array von FileResponse-Objekten         |
| GET     | /api/files/thumbnail/{fileName}| Vorschaubild der ersten Seite einer PDF abrufen | fileName (Pfadvariable)     | JPEG-Bild                              |
| POST    | /api/files/stamp/{fileName}    | Einen Stempel auf eine PDF anbringen    | fileName (Pfad), Query-Parameter: date, name, comment | FileResponse JSON |
| GET     | /api/files/download/{fileName} | Eine PDF-Datei herunterladen            | fileName (Pfadvariable)             | PDF-Datei                              |
| DELETE  | /api/files/{fileName}          | Eine PDF-Datei löschen                  | fileName (Pfadvariable)             | JSON mit "deleted" Status              |

## Fehlerbehandlung

Die Anwendung enthält umfassende Fehlerbehandlung für:

- Datei nicht gefunden
- Speicherprobleme
- PDF-Verarbeitungsfehler
- CORS-Konfiguration
- Dateigröße-Begrenzungen

## Testen

### Backend-Tests

Das Backend kann mit Postman oder cURL getestet werden:

1. **Upload-Test**: POST einer PDF-Datei an `/api/files/upload`
2. **Listen-Test**: GET der Dateiliste von `/api/files/list`
3. **Vorschaubild-Test**: GET des Vorschaubilds von `/api/files/thumbnail/{fileName}`
4. **Stempel-Test**: POST der Stempelanfrage an `/api/files/stamp/{fileName}` mit Query-Parametern
5. **Download-Test**: GET der Datei von `/api/files/download/{fileName}`
6. **Lösch-Test**: DELETE der Datei bei `/api/files/{fileName}`

Detaillierte Schritt-für-Schritt-Testanweisungen finden Sie im Dokument "Backend testing steps with Postman".

## Anforderungen

### Backend-Anforderungen

- Java JDK 11 oder höher
- Spring Boot
- Apache PDFBox (für PDF-Verarbeitung)
- Maven

### Frontend-Anforderungen

- Node.js
- React
- npm oder yarn

## Installation und Einrichtung

### Backend-Einrichtung

1. Navigieren Sie zum Verzeichnis `backend`
2. Führen Sie `mvn install` aus, um Abhängigkeiten zu installieren
3. Konfigurieren Sie `application.properties` nach Bedarf
4. Führen Sie `mvn spring-boot:run` aus, um den Server zu starten

### Frontend-Einrichtung

1. Navigieren Sie zum Verzeichnis `frontend`
2. Führen Sie `npm install` aus, um Abhängigkeiten zu installieren
3. Konfigurieren Sie die API-Basis-URL in `FileService.js`, falls erforderlich
4. Führen Sie `npm start` aus, um den Entwicklungsserver zu starten

## Zukünftige Erweiterungen

Potenzielle Verbesserungen für zukünftige Versionen:

1. Benutzerauthentifizierung
2. Mehrere Stempelvorlagen
3. Benutzerdefinierte Stempelpositionierung
4. Stapelverarbeitung
5. Cloud-Speicher-Integration
6. Unterstützung für andere Dokumentformate

## Fazit

Der PDF Stamper ist eine leichte, aber funktionale Lösung für grundlegende PDF-Stempelanforderungen. Seine modulare Architektur macht ihn leicht erweiterbar und wartbar.