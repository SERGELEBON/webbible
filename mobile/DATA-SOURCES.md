# Sources et attribution

- Identité visuelle, logo blanc et icône : https://litabible.com, site fourni par le propriétaire du dépôt. Couleurs principales `#1a4fa0` et `#f5c400`.
- Texte français : **Louis Segond 1910**, œuvre du domaine public. Copie embarquée depuis https://api.getbible.net/v2/ls1910.json, récupérée le 12 novembre 2026. Distribution : https://getbible.net. Les balises de présentation du fournisseur sont retirées. `src/bible.json` conserve les 66 livres et la numérotation des versets du fournisseur.
- Les favoris, réglages et position de lecture restent sur l’appareil (AsyncStorage). Aucun compte ni serveur n’est nécessaire pour lire ou rechercher.
- Audio : synthèse vocale française du système via `expo-speech`. Ce ne sont pas les enregistrements audio de litabible.com ; la disponibilité et le fonctionnement hors ligne dépendent des voix installées. Les longs chapitres sont découpés en segments de 3 000 caractères.
- Le verset du jour tourne parmi sept passages embarqués en fonction de la date locale. Le rendez-vous quotidien proposé est un Psaume, pas un flux liturgique synchronisé au site.
