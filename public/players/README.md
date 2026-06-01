# Player images by nation

Each participating nation has its own folder:

```
public/players/
  argentina/
  brazil/
  portugal/
  ...
```

## How to add a player

1. Save the image in the correct nation folder, e.g. `public/players/portugal/diogocosta.png`
2. Register the player (nation is detected from the folder):

```bash
npm run player:add -- portugal diogocosta.png "Diogo Costa" Goalkeeper
```

3. The player appears in **Draft → Initial Draft** and **Redraft** until assigned to a user.

### Optional: batch via meta files

Create `diogocosta.meta.json` next to the image:

```json
{ "name": "Diogo Costa", "position": "Goalkeeper" }
```

Then run:

```bash
npm run players:sync
```

### Owner role

The Owner UI is for **assigning** players to user teams, not manual form entry.

Do not add placeholder or fake player images to the repo.
