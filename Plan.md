# Plan — Application web TypeScript/three.js pour la conception de menuiseries

## Contexte

L'extension SketchUp Ruby actuelle (`SketchupMenuiseriesMaker`) fonctionne et son modèle orienté objet (Bâti/Ouverture/OuvertureVide/Remplissage/Profil/Structure) a fait ses preuves, mais elle est prisonnière de SketchUp (UI native `UI.inputbox`, outil clic-droit couplé à l'API SketchUp). L'objectif est de reconstruire cet outil en **application web autonome, 100% front (TypeScript + three.js), sans serveur ni Ruby**, avec un workflow :

1. Saisie des dimensions → génération d'une fenêtre "vide" (réactive, pas d'action manuelle).
2. Sélection et découpe interactive d'une zone vide, **au mm près**.
3. Remplissage des zones (vitrage fixe / ouvrant fenêtre avec option oscillo-battant / panneau plein).
4. Export du modèle (format d'échange 3D importable dans SketchUp) + chiffrage (carrelets bois + dimensions de vitrage à commander), avec la quincaillerie prévue comme extension future.
5. En transverse : pouvoir créer/sauvegarder/recharger plusieurs fenêtres, et les partager via un fichier JSON.

Décisions actées avec l'utilisateur :

- Pas de backend, pas de .skp natif — export vers un format d'échange, import manuel dans SketchUp pour assembler la maison complète.
- La découpe se fait en **2D** (élévation), pas en manipulation 3D directe : une division ne touche jamais qu'un seul axe à la fois, c'est un arbre de rectangles. La vue 3D reste une **visualisation dérivée** du même modèle de données ("une source de vérité, deux rendus").
- Écran central : **bascule par onglet** entre "Vue 3D" et "Plan 2D".
- Chiffrage carrelets v1 : liste brute groupée par profil + métrage linéaire total, **en conservant les longueurs de pièces individuelles** (pas seulement des totaux) pour permettre un futur algorithme de nesting/bin-packing sans refonte du modèle de données.
- Oscillo-battant : attribut par ouvrant (battant / oscillo-battant), stocké + exporté, représenté par un symbole/flèche d'ouverture sur le plan 2D. Pas de calcul de quincaillerie pour l'instant.
- **Pas de bouton "Générer"** : la vue 2D/3D se met à jour de façon réactive dès que les données changent (client-only, pas de round-trip serveur à justifier un déclenchement manuel).
- **Gestion de projets dès le début** : pouvoir créer plusieurs fenêtres, les sauvegarder localement, y revenir facilement, et les exporter/importer en JSON pour les partager — pensé comme un contrat de données dès l'étape 1, pas ajouté après coup.
- **Ordre de construction "écrans d'abord"** : on définit les contrats de données (formes des types) et une fixture statique tout de suite, puis on construit les écrans (UI, plan 2D, 3D) contre cette fixture, et on implémente le modèle métier réel en dernier, TDD, en le branchant sur les écrans déjà existants. Ça permet de valider vite les écrans (priorité affichée par l'utilisateur) sans travail jetable, puisque les écrans sont construits contre un contrat qui ne change pas.
- Implémentation par étapes, chaque étape livrant une app **toujours fonctionnelle**, TDD pour la logique (test rouge → correctif → test vert), une PR par étape, tests end-to-end dès que l'UI existe (Playwright).

Règle de codage à respecter (CLAUDE.md) : code en anglais. Le domaine métier reste en français dans les échanges/documentation, mais noms de classes/méthodes/champs en anglais dans le code — d'où le glossaire de correspondance ci-dessous, à suivre strictement pour que "l'organisation orientée objet qui a fait ses preuves" reste reconnaissable malgré la traduction.

## Glossaire de correspondance Ruby → TypeScript

| Ruby (`src/MenuiseriesExterieures/*.rb`) | TypeScript | Rôle |
| --- | --- | --- |
| `Bois` | `Wood` (thickness, width) | dimensions du bois |
| `Batee` | `Rabbet` (thickness, width) | feuillure qui retient vitrage/ouvrant |
| `Joint` | `WeatherSeal` (grooveWidth, grooveDepth) | rainure du joint |
| `Details` | `Tolerances` (glazingClearance, glazingThickness, sashClearance) | jeux de fabrication |
| `Tableau` | `RoughOpening` (width, height) | dimensions du trou dans le mur |
| `Pose` | `Installation` (roughOpening, setback) | pose + cochonnet |
| `Profil` | `Profile` (simpleRabbet / opposedDoubleRabbets / symmetricDoubleRabbets) | fabrique de sections 2D |
| `Structure` | `Positionable` | calcul position + rotation (base commune) |
| `Bati` / `BatiFenetre` / `BatiPorteFenetre` | `Frame` / `WindowFrame` / `FrenchDoorFrame` (différé) | dormant |
| `Seuil` | `Sill` | seuil alu porte-fenêtre (différé) |
| `Ouverture` / `Fixe` / `Ouvrant` | `Opening` / `FixedLight` / `Sash` | ouverture mobile ou fixe |
| `OuvrantFenetre` / `OuvrantPorteFenetre` | `CasementSash` / `FrenchDoorSash` (différé, vide côté Ruby aussi) | ouvrant fenêtre |
| `OuvertureVide` | `VoidOpening` | zone vide divisible/remplissable — **cœur interactif** |
| `Remplissage` / `RemplissageVitrage` / `RemplissageBois` / `RemplissageVide` | `Infill` / `GlazingInfill` / `SolidPanelInfill` / `PlaceholderInfill` | remplissage d'une zone |

Bugs Ruby identifiés à corriger (pas à reproduire) pendant le portage : `Fixe` référence `detail` au lieu de `details` (`Ouvertures.rb:19`) ; `RemplissageBois` réutilise la clé matériau `"Vitrage"` (`Remplissages.rb:74`) au lieu d'une clé dédiée.

## Architecture technique

- **Stack** : TypeScript + Vite, React + `@react-three/fiber` + `@react-three/drei` pour la vue 3D, un éditeur 2D en **SVG** (composants React) pour le plan d'élévation, état partagé via un store (Zustand). Aucun backend — déploiement statique.
- **Contrat de données avant tout** : les formes de données (`WindowParams`, `VoidOpeningNode`, `PartDescriptor`, `InfillState`, `BomLine`, `WindowProject`) sont figées dès l'étape 1, avant l'implémentation du modèle métier réel. Une fixture statique conforme à ces types sert à construire les écrans (étapes 2-4) ; le modèle métier réel (étape 5) implémente ensuite ces mêmes types, donc brancher le "vrai" modèle sur les écrans déjà construits est du câblage, pas une reconception.
- **Séparation domaine / rendu** : le modèle métier ne connaît ni three.js ni le DOM.
  - `PartDescriptor` (pièces de bois/seuil/remplissage : profil, longueur, position, rotation, matériau) → consommé par la vue 3D pour instancier des `ExtrudeGeometry` (équivalent de `Profil#tracerX` + `pushpull`).
  - L'arbre `VoidOpeningNode` (rectangles + état de remplissage) → consommé directement par le plan 2D.
- **Unités** : modèle métier en millimètres. Conversion mm→m uniquement à la frontière du rendu three.js et de l'export glTF (qui suppose des mètres).
- **Réactivité** : toute modification de state (formulaire, découpe, remplissage) redérive automatiquement `VoidOpeningNode`/`PartDescriptor` et re-render 2D/3D — pas de bouton "Générer". Une fois des découpes existantes, modifier un paramètre global du bâti recalcule l'ensemble en conservant les proportions des découpes existantes (et les borne aux nouvelles limites si nécessaire).
- **Persistance** : un `WindowProject` (`{id, name, params: WindowParams, tree?: VoidOpeningNode}`) est l'unité sauvegardée en `localStorage` et exportable/importable en `.json`. Tant qu'aucune découpe n'existe, `tree` est absent et entièrement recalculable depuis `params` ; dès qu'une découpe est faite, `tree` devient la source de vérité (les découpes ne sont pas dérivables des seuls paramètres initiaux).
- **Export** : glTF binaire (`.glb`) via `THREE.GLTFExporter`, conserve hiérarchie de groupes et matériaux transparents ; import possible dans SketchUp via l'extension officielle Trimble glTF.
- **Tests** : Vitest (unitaire, domaine + persistance + logique pure des interactions), React Testing Library (composants), Playwright (E2E, workflow complet dans un vrai navigateur).

## Étapes (chacune = une PR, toujours fonctionnelle)

**Étape 0 — Socle du projet**
Scaffold Vite + React + TS, structure de dossiers (`src/domain`, `src/persistence`, `src/scene3d`, `src/plan2d`, `src/ui`, `src/export`), Vitest configuré, déploiement statique de base. Checkpoint : page vide qui build/déploie.

**Étape 1 — Contrats de données, fixture et persistance**
Définition des types purs (`WindowParams`, `VoidOpeningNode`, `PartDescriptor`, `InfillState`, `BomLine`, `WindowProject`), sans implémentation de la géométrie derrière. Une fixture statique (`src/domain/fixtures.ts`) représentant une fenêtre exemple à 3 zones (une découpée, remplissages variés) conforme à ces types, utilisée par les étapes suivantes en attendant le vrai modèle. Module de persistance (`src/persistence/projectStore.ts`) : CRUD `localStorage` par `WindowProject` (créer/lister/renommer/dupliquer/supprimer), export en fichier `.json` (download navigateur) et import depuis un `.json` (upload). TDD complet sur la persistance (pure, mockable, aucune dépendance UI/3D). Checkpoint : `npm test` passe ; la persistance est fonctionnelle et testée sans aucun écran.

**Étape 2 — UI de base + gestion de projets**
Shell 3 bandeaux (gauche/centre/droit). Bandeau de gestion de projets (liste des fenêtres sauvegardées, nouveau/dupliquer/renommer/supprimer, exporter/importer JSON), branché sur la persistance de l'étape 1. Formulaire gauche reprenant les 14 champs de `main.rb#prompt` (cochonnet/setback, bois ouvrant/dormant, batée, rainure joint, jeu, vitrage, référence, tableau), mêmes valeurs par défaut converties en mm, mise à jour réactive de `WindowParams` à la saisie (sauvegarde auto du projet courant). Le centre affiche encore la fixture statique de l'étape 1 (pas branchée sur le formulaire). Type porte-fenêtre visible mais désactivé (différé). Checkpoint : on peut créer, nommer, remplir, sauvegarder, recharger et exporter/importer plusieurs fenêtres — le workflow de gestion de projet est déjà utilisable, même si le rendu central est encore figé.

**Étape 3 — Plan 2D**
Rendu SVG de l'arbre `VoidOpeningNode` de la fixture (rectangles à l'échelle mm→px, couleur selon l'état de remplissage). Clic sur un rectangle → sélection → panneau droit affiche les infos de la zone (dimensions, état). Pas encore d'édition, pas encore branché sur le formulaire. Checkpoint : plan 2D lisible et navigable sur la fixture.

**Étape 4 — Visualisation 3D**
Composants React Three Fiber consommant les `PartDescriptor` de la fixture : extrusion (`ExtrudeGeometry`, équivalent du `pushpull` Ruby), matériaux fidèles à `Remplissages.rb` (vitrage bleu translucide, panneau gris opaque avec clé matériau dédiée, placeholder vert translucide), `OrbitControls`. Onglet "Vue 3D / Plan 2D" au-dessus du centre, sélection synchronisée entre les deux vues (raycast en 3D ↔ clic en 2D). Checkpoint : les deux vues de l'écran final existent et sont navigables, sur données figées.

**Étape 5 — Modèle métier réel (TDD)**
Port des objets de valeur (`Wood`, `Rabbet`, `WeatherSeal`, `Tolerances`, `RoughOpening`, `Installation`), de `Profile` (3 variantes de section + largeurs dérivées), `Positionable`, `Frame`/`WindowFrame`, `Opening`/`FixedLight`/`Sash`/`CasementSash`, `VoidOpening` (bornes de découpe, production du `VoidOpeningNode` réel) et `Infill`/sous-classes — chacun implémentant exactement les types de l'étape 1. Port des tests `tests/testBati.rb` et `tests/testOuvertureVide.rb` en Vitest, TDD strict, corrections des deux bugs Ruby au passage. Branchement : le formulaire (étape 2) pilote maintenant réellement `VoidOpeningNode`/`PartDescriptor`, en direct — la fixture disparaît, 2D (étape 3) et 3D (étape 4) affichent la vraie géométrie sans changement de leur code de rendu. Checkpoint : workflow 1 complet et réactif, bout en bout, avec un vrai moteur géométrique testé.

**Étape 6 — Découpe interactive au mm + remplissage (workflow étape 2-3)**
Sur une zone sélectionnée en plan 2D : poignée de découpe draggable (verticale ou horizontale, choix dans le panneau droit), bornée par `VoidOpening.minCutDimension` (2×largeur rabbet) et les bornes max, synchronisée bidirectionnellement avec un champ numérique mm dans le panneau droit (drag met à jour le champ, saisie met à jour le drag). "Valider" → `splitVertical`/`splitHorizontal` (ajout du meneau via `Profile.symmetricDoubleRabbets`), régénère 2D + 3D. Actions de remplissage sur zone vide : vitrage fixe, ouvrant fenêtre (toggle battant/oscillo-battant → flèche symbole en 2D), panneau plein. Le `WindowProject` persisté (étape 1/2) capture désormais aussi `tree` (l'arbre de découpes/remplissages), plus seulement `params`. Tests : logique drag→snap→clamp testée en pur (indépendante des événements pointeur), tests Vitest étendus sur `VoidOpening`. Test Playwright : générer → découper à une cote précise → remplir les deux zones → vérifier 2D/3D → sauvegarder → recharger → vérifier que les découpes sont restaurées. Checkpoint : workflow de conception interactif complet, projets entièrement sauvegardables/partageables.

**Étape 7 — Export + chiffrage (workflow étape 4)**
Export `.glb` : les `PartDescriptor` déjà utilisés pour la vue 3D, conversion mm→m, `THREE.GLTFExporter`, téléchargement navigateur. Vérification manuelle (hors suite automatisée) : import du `.glb` dans SketchUp via l'extension Trimble glTF. Chiffrage : chaque objet du domaine expose `getBillOfMaterialsLines()` (récursif, même pattern que `tracer()`), agrégé par `WindowFrame` :

- Carrelets : groupés par variante de profil (bâti/ouvrant/meneau), **liste des longueurs individuelles conservée** (pas seulement un total) + métrage linéaire total — pour un futur algorithme de nesting/bin-packing sans changer le modèle de données.
- Vitrage : liste largeur×hauteur×épaisseur par vitrage, jeu déjà appliqué.
- Quincaillerie : catégorie prévue mais non peuplée ; `openingType` de `CasementSash` est déjà disponible pour une future étape.
  Panneau "Chiffrage" dans l'UI. Test Playwright complet : créer projet → découper → remplir → exporter → vérifier déclenchement du téléchargement et contenu du panneau de chiffrage. Checkpoint : MVP complet.

## Explicitement hors périmètre de ce plan (à traiter dans un plan futur)

- Porte-fenêtre (`FrenchDoorFrame` + `Sill`) et son ouvrant (`FrenchDoorSash`, déjà vide côté Ruby).
- Doubles-ouvrants / meneau entre deux vantaux côte à côte (jamais fini côté Ruby non plus).
- Quincaillerie réelle (paumelles, poignées, mécanisme oscillo-battant, espagnolette) et son chiffrage.
- Optimisation d'achat / nesting des carrelets sur barres standard (bin-packing) — anticipé dans le modèle de données de l'étape 7, mais pas implémenté.
- Undo/redo.
- Export `.skp` natif (toujours hors de portée en full-front ; non nécessaire vu le workflow retenu).

## Fichiers/dossiers clés à créer

```
src/domain/types.ts         # WindowParams, VoidOpeningNode, PartDescriptor, InfillState, BomLine, WindowProject
src/domain/fixtures.ts      # fenêtre d'exemple statique pour les étapes 2-4
src/domain/values.ts        # Wood, Rabbet, WeatherSeal, Tolerances, RoughOpening, Installation
src/domain/profile.ts       # Profile — 3 variantes de section + largeurs dérivées
src/domain/positionable.ts  # position/rotation partagés (données, pas de rendu)
src/domain/frame.ts         # Frame, WindowFrame (FrenchDoorFrame différé)
src/domain/opening.ts       # Opening, FixedLight, Sash, CasementSash
src/domain/voidOpening.ts   # VoidOpening — découpe + remplissage récursifs
src/domain/infill.ts        # Infill, GlazingInfill, SolidPanelInfill, PlaceholderInfill
src/domain/bom.ts           # agrégation chiffrage (étape 7)
src/persistence/projectStore.ts   # CRUD localStorage + export/import JSON (étape 1)
src/scene3d/                # composants React Three Fiber (PartDescriptor → meshes)
src/plan2d/                 # éditeur SVG (VoidOpeningNode → rectangles + interaction)
src/ui/                     # shell 3 bandeaux, bandeau projets, formulaire gauche, panneau droit
src/export/gltfExport.ts
tests/ (Vitest, un fichier miroir par module domaine/persistance) + e2e/ (Playwright)
```

## Vérification

- Chaque étape : `npm test` (Vitest) doit passer avant de passer à la suivante — TDD rouge/vert comme d'habitude.
- Tests Playwright après les étapes 2, 6 et 7 (workflow croissant), lancés via `npx playwright test`.
- `npm run dev` pour validation visuelle de chaque checkpoint (gestion de projets, plan 2D, 3D, panneaux).
- Vérification manuelle finale de l'étape 7 : importer le `.glb` exporté dans SketchUp (extension glTF Trimble) et vérifier géométrie/échelle une fois intégré à une maquette de maison complète.
- Une Pull Request par étape, pour relecture avant de passer à la suivante.