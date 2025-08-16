# Import menu

- Im /menus Screen soll es unterhalb des Menü hinzufügen Button auch ein Import Menü Button geben
- Es öffnet sich bei dem Button ein Dialog, wo man eine URL angeben kann und einen Import Button
- Die URL wird beim Import zur API gesendet
- Die Domain der URL wird gelesen und für jede Domain gibt es einen eigenen Mapper. Wenn es für die Domain keinen Mapper gibt, wird eine Fehlermeldung zurückgegeben und angezeigt
- Gibt es einen Mapper wird die URL aufgerufen und der Inhalt in den Mapper gegeben
- Der Mapper parst die Informationen für das Menü von der Webseite heraus und erstellt damit ein neues Menü
- Nach dem Import wird das Menü zum Frontend geschickt und der Edit Dialog geöffnet um weitere Änderungen vornehmen zu können
