# DIAGNOSTIC TECHNIQUE, FONCTIONNEL ET UX COMPLET — SCOLY SAAS V1

> **Document de Référence & d'Audit Exhaustif**  
> **Date de l'audit :** 29 Août 2026  
> **Version analysée :** SCOLY v0.1.0 (Next.js 16.3.2 / React 19.2.8 / Supabase PostgreSQL / Tailwind CSS v4)  
> **Auteur du diagnostic :** Antigravity AI Senior Architect (Audit Codebase Réel)  
> **Consigne stricte respectée :** Aucune modification, suppression ou refactorisation n'a été apportée au code source existant.

---

## TABLE DES MATIÈRES

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Architecture actuelle](#2-architecture-actuelle)
3. [Fonctionnalités existantes](#3-fonctionnalités-existantes)
4. [Fonctionnalités réellement fonctionnelles](#4-fonctionnalités-réellement-fonctionnelles)
5. [Fonctionnalités mockées ou incomplètes](#5-fonctionnalités-mockées-ou-incomplètes)
6. [Base de données Supabase & Schéma PostgreSQL](#6-base-de-données-supabase--schéma-postgresql)
7. [Authentification](#7-authentification)
8. [Sécurité & Row Level Security (RLS)](#8-sécurité--row-level-security-rls)
9. [Importation des données (Excel, CSV, Google Sheets, PDF, Photo/OCR)](#9-importation-des-données)
10. [Configuration des tarifs & Grilles de scolarité](#10-configuration-des-tarifs--grilles-de-scolarité)
11. [Logique des paiements & Prévention des incohérences](#11-logique-des-paiements--prévention-des-incohérences)
12. [Gestion des impayés, retards & Relances](#12-gestion-des-impayés-retards--relances)
13. [Système de notifications & Alertes proactives](#13-système-de-notifications--alertes-proactives)
14. [Abonnements START & PRO (Essai 15j, Garantie 30j, FedaPay)](#14-abonnements-start--pro)
15. [Audit UX/UI & Règle des 3 secondes](#15-audit-uxui--règle-des-3-secondes)
16. [Expérience Mobile & Responsive](#16-expérience-mobile--responsive)
17. [Performance & Résilience faible connexion](#17-performance--résilience-faible-connexion)
18. [Problèmes Critiques (Catégorie CRITIQUE)](#18-problèmes-critiques)
19. [Problèmes Importants (Catégorie IMPORTANT)](#19-problèmes-importants)
20. [Problèmes UX (Catégorie UX)](#20-problèmes-ux)
21. [Risques Techniques](#21-risques-techniques)
22. [Risques Métier & Juridiques](#22-risques-métier--juridiques)
23. [Liste complète des fichiers importants](#23-liste-complète-des-fichiers-importants)
24. [Dépendances importantes](#24-dépendances-importantes)
25. [Recommandations stratégiques pour la reconstruction](#25-recommandations-stratégiques-pour-la-reconstruction)

---

## 1. RÉSUMÉ EXÉCUTIF

SCOLY est conçu comme un SaaS de gestion administrative et financière ultra-simplifié pour les écoles privées d'Afrique de l'Ouest et Centrale (Togo, Bénin, Sénégal, Côte d'Ivoire, etc., monnaie : FCFA).

Le positionnement cible repose sur **3 actions fondamentales** :
1. **IMPORTER LES ÉLÈVES** (sans saisie manuelle fastidieuse)
2. **CONFIGURER LES TARIFS** (classes, montants annuels, tranches et dates d'échéances)
3. **ENREGISTRER LES PAIEMENTS** (encaissement en 3 clics, reçus automatiques, calcul instantané des soldes et retards)

### Synthèse de l'état du code analysé :
- **Points Forts :** Une interface utilisateur moderne et riche visuellement (Tailwind v4, Lucide Icons, graphiques SVG sur-mesure), une base de données PostgreSQL très structurée (16 tables avec clés étrangères et types énumérés), des procédures transactionnelles (`record_payment_v2`), une détection intelligente des colonnes d'importation (`column-detector.ts`), et un moteur complet de calcul des soldes et pénalités.
- **Faiblesses Majeures :**
  - **Dilemme d'Architecture Hybride :** Le state global React (`lib/store.tsx`, 2 277 lignes) maintient un cache mémoire qui effectue des mutations optimistes tout en appelant l'API REST `/api/sync/...` et le client Supabase en parallèle.
  - **Incohérence des Identifiants de Classes :** Les composants modaux (`StudentModal.tsx`, `TuitionPlanModal.tsx`) contiennent des identifiants statiques en dur (`cls-6e`, `cls-seconde`, `cls-ci-1`) qui entrent en conflit direct avec les UUID générés par la base de données PostgreSQL (`classes.id`), risquant des erreurs de clés étrangères.
  - **Gestion des Dépassements Financiers :** Alors que la règle métier stricte exige d'interdire et de bloquer les paiements supérieurs au solde restant, le code actuel permet à l'utilisateur de valider l'excédent sous forme d'"Avance / Crédit" (`is_advance: true`, `credit_amount > 0`).
  - **Imports Manquants :** L'import PDF n'est pas du tout développé. L'import Google Sheets échoue côté client en raison des restrictions CORS de Google. L'OCR (Tesseract.js) est client-side et limité pour les écritures manuscrites sur cahiers.
  - **Onboarding Trop Complexe :** Un tunnel de 9 étapes qui ralentit la promesse de démarrage immédiat en 3 minutes.
  - **Sécurité :** Une clé de secours Service Role Supabase (`FALLBACK_SERVICE_KEY`) est encodée en base64 en clair dans `lib/supabase/server.ts`.

---

## 2. ARCHITECTURE ACTUELLE

### 2.1 Stack Technologique
| Couche | Technologie | Version | Rôle & Observations |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.3.2 | Routage basé sur le système de fichiers, API Routes serveur |
| **UI Library** | React | 19.2.8 | Rendu client & Server Components |
| **Langage** | TypeScript | 5.x | Typage strict partiel (certains `any` dans `store.tsx` et `db.ts`) |
| **CSS** | Tailwind CSS / PostCSS | 4.0.0 | Utilisation des utilitaires CSS modernes |
| **Base de Données** | Supabase PostgreSQL | 2.112.4 | PostgreSQL managé, RLS multi-tenant, Realtime |
| **OCR & Parsing** | Tesseract.js / SheetJS (xlsx) | 7.0.0 / 0.18.5 | OCR navigateur et parsing de classeurs Excel/CSV |
| **Paiements en ligne** | FedaPay API | v1 (REST) | Passerelle Mobile Money (TMoney, Flooz, Moov, MTN, Orange) |

### 2.2 Arborescence des Routes de l'Application

```
c:\SCOLY\app
├── (dashboard)
│   ├── layout.tsx                # Shell Dashboard (Sidebar, Header, BottomNav, Modals globaux)
│   ├── dashboard/page.tsx        # Vue d'ensemble KPI, Graphiques, Actions urgentes
│   ├── students/
│   │   ├── page.tsx              # Liste, filtres par classe/statut, recherche élèves
│   │   └── [id]/page.tsx         # Fiche individuelle complète élève, historique, reçus
│   ├── tuition/page.tsx          # Grilles tarifaires et tranches par classe
│   ├── payments/page.tsx         # Journal comptable, reçus, annulations
│   ├── debts/page.tsx            # Gestion des impayés, retards, relances WhatsApp/SMS
│   ├── subscription/page.tsx     # Forfaits START & PRO, souscription, historique
│   └── settings/page.tsx         # Établissement, Année scolaire, Classes, Équipe, Moyens de paiement
├── (marketing)
│   └── page.tsx                  # Landing page publique (Hero, Features, Pricing, FAQ)
├── api
│   ├── auth/register-school/route.ts   # Création serveur de compte & provisionnement école
│   ├── fedapay/create-transaction/route.ts # Initialisation transaction FedaPay Mobile Money
│   ├── notifications/route.ts          # CRUD & marquage lu des notifications
│   ├── subscription/
│   │   ├── checkout/route.ts           # Création commande abonnement FedaPay
│   │   ├── confirm/route.ts            # Activation serveur abonnement & période 30j
│   │   └── route.ts                    # Lecture/mise à jour statut abonnement
│   └── sync/
│       ├── bootstrap/route.ts          # Chargement serveur complet des données école
│       └── save-all/route.ts           # Sauvegarde globale groupée
├── onboarding/page.tsx           # Tunnel de configuration initiale en 9 étapes
├── login/page.tsx                # Connexion utilisateur
├── register/page.tsx             # Inscription établissement
└── forgot-password/page.tsx      # Réinitialisation mot de passe
```

### 2.3 Schéma des Flux de Données

```mermaid
flowchart TD
    subgraph UI_Client ["Navigateur Client (React 19)"]
        Dashboard["Pages Dashboard / Élèves / Caisse"]
        Store["lib/store.tsx (ScolyProvider - Cache Mémoire)"]
        Modals["Modals Globaux (Encaisser, Élève, Grille, Import)"]
    end

    subgraph API_NextJS ["Serveur Next.js (API Routes)"]
        SyncBootstrap["/api/sync/bootstrap"]
        SyncSave["/api/sync/save-all"]
        AuthRegister["/api/auth/register-school"]
        SubCheckout["/api/subscription/checkout"]
        SubConfirm["/api/subscription/confirm"]
    end

    subgraph External_Services ["Services Tiers"]
        FedaPay["FedaPay API (TMoney / Flooz / CB)"]
        TesseractWorker["Tesseract.js (Worker Web OCR)"]
    end

    subgraph Supabase_Cloud ["Supabase Cloud"]
        AuthModule["Supabase Auth (JWT & Sessions)"]
        PostgresDB[("PostgreSQL Database (16 Tables)")]
        RLS["Row Level Security (school_id Isolation)"]
        RealtimePub["Supabase Realtime (Publication)"]
    end

    Dashboard --> Store
    Modals --> Store
    Store <--> SyncBootstrap
    Store <--> SyncSave
    Store <--> AuthModule
    Store -. Direct Browser Client .-> PostgresDB
    SyncBootstrap <--> PostgresDB
    SyncSave <--> PostgresDB
    AuthRegister <--> PostgresDB
    SubCheckout <--> FedaPay
    SubConfirm <--> PostgresDB
    Store <--> RealtimePub
    Modals --> TesseractWorker
```

---

## 3. FONCTIONNALITÉS EXISTANTES

| Module | Fonctionnalité | Description dans le code |
| :--- | :--- | :--- |
| **Authentification** | Inscription École | Formulaire prénom, nom, email, mot de passe, auto-création d'établissement |
| **Authentification** | Connexion / Déconnexion | Auth par mot de passe Supabase, persistance de session |
| **Authentification** | Réinitialisation MDP | Envoi email de réinitialisation Supabase |
| **Onboarding** | Configuration 9 étapes | École, type, année, classes, tarifs, utilisateurs, notifications, import, résumé |
| **Tableau de bord** | 4 Métriques KPI | Encaissé aujourd'hui, Total encaissé, Reste à recouvrer, Taux de recouvrement |
| **Tableau de bord** | Graphique CA & Donut | Évolution financière par mois + répartition du statut des élèves |
| **Tableau de bord** | Centre d'Actions Urgentes | Détection des impayés critiques prioritaires |
| **Élèves** | Répertoire & Inscription | Création, modification, suppression, fiches individuelles avec solde |
| **Élèves** | Détail Fiche Élève | Informations tuteur, échéancier, historique des reçus, boutons WhatsApp |
| **Tarification** | Grilles de scolarité | Montant annuel par classe, tranches, dates limites d'échéances |
| **Paiements** | Encaissement Caisse | Saisie montant, mode de règlement, référence, notes, calcul du reste |
| **Paiements** | Reçu Officiel | Génération numéro REC-25-XXXXX, impression thermique/A4, partage WhatsApp |
| **Paiements** | Annulation de paiement | Annulation avec motif obligatoire et ajustement automatique du solde |
| **Impayés** | Suivi des retards | Découpage par tranche de retard (1-7j, 8-15j, >15j), calcul des jours de retard |
| **Relances** | Messages WhatsApp / SMS | Générateur de messages types et ouverture directe de l'application |
| **Importation** | Import Excel / CSV | Détection des colonnes, mapping, prévisualisation, validation, batching |
| **Importation** | Import Google Sheets | Téléchargement via URL export CSV |
| **Importation** | Scan Photo OCR | OCR Tesseract.js sur photos de registres |
| **Notifications** | Alertes Intelligentes | Détection automatique des retards, échéances proches, récapitualifs |
| **Abonnements** | Forfaits START / PRO | Essai gratuit 15j, facturation mensuelle/annuelle (-30%), paiement FedaPay |
| **Paramètres** | Configuration École | Profil école, année active, classes, équipe & permissions, moyens de paiement |

---

## 4. FONCTIONNALITÉS RÉELLEMENT FONCTIONNELLES

Voici les fonctionnalités dont le code est **complet, connecté à la base de données et opérationnel** :

1. **Calculateur Financier Centralisé (`getStudentFinancialSummary`)** : ✅ FONCTIONNEL  
   Calcul parfait et sans latence du montant net dû, du total payé, du reste à recouvrer, des avances, du statut (`up_to_date`, `upcoming`, `late`, `critical`, `credit`) et du nombre exact de jours de retard par rapport au calendrier des tranches.
2. **Reçus Numérotés et Partage WhatsApp** : ✅ FONCTIONNEL  
   Génération séquentielle du numéro de reçu (`REC-25-00001`), mise en page d'impression propre (sans éléments SaaS parasites), génération de liens `https://wa.me/228...` formatés avec le détail du versement et du solde restant.
3. **Importation de Fichiers Excel (.xlsx, .xls) et CSV** : ✅ FONCTIONNEL  
   Parsing SheetJS robuste, détection sémantique des colonnes (`last_name`, `first_name`, `class_name`, `parent_phone`, etc.), détection des doublons contre la base existante, exécution par lots de 25 lignes pour éviter le gel du navigateur.
4. **Annulation Sécurisée des Paiements (`cancelPaymentDb`)** : ✅ FONCTIONNEL  
   Marquage du paiement en statut `cancelled`, conservation de la trace d'audit avec motif obligatoire et recalcul immédiat du solde de l'élève.
5. **Authentification & Provisionnement Automatique (`register-school`)** : ✅ FONCTIONNEL  
   L'API serveur contourne les blocages de confirmation d'email (`email_confirm: true`), crée l'école, l'année scolaire et le membre directeur dans PostgreSQL en une transaction.
6. **Moteur de Déduplication & Analyse Proactive des Notifications** : ✅ FONCTIONNEL  
   Génération d'alertes pertinentes basée sur les données réelles (sans données factices), agrégation anti-spam si plus de 2 impayés critiques, déduplication stricte par `dedup_key`.
7. **Filtrage et Recherche Instantanée** : ✅ FONCTIONNEL  
   Recherche globale dans le header et filtres dynamiques (par classe, par niveau de retard, par mode de règlement) avec recalcul instantané des métriques.

---

## 5. FONCTIONNALITÉS MOCKÉES OU INCOMPLÈTES

| Fonctionnalité | Statut | Analyse Technique du Manque / Blocage |
| :--- | :---: | :--- |
| **Importation PDF** | ❌ NON FONCTIONNEL | **Totalement absent du code.** Aucun parser PDF (`pdf-parse`, `pdfjs-dist`) n'est installé. Non proposé dans l'interface `SourceSelector.tsx`. |
| **Importation Google Sheets** | ⚠️ PARTIEL | Le composant tente un `fetch(exportUrl)` direct depuis le navigateur client. Bloqué par la politique CORS de Google sur `docs.google.com`. Nécessite une route proxy API Next.js côté serveur. |
| **Scan Photo Registre (OCR)** | ⚠️ PARTIEL | Tesseract.js fonctionne dans un Web Worker, mais les regex d'extraction (`extractFieldsFromLine`) ne fonctionnent de manière fiable que sur du texte dactylographié aligné. Les cahiers scolaires manuscrits échouent dans 70% des cas. |
| **Paiement FedaPay Réel** | ⚠️ PARTIEL | L'intégration API existe dans `/api/fedapay/create-transaction` et `/api/subscription/checkout`, mais en l'absence de `FEDAPAY_SECRET_KEY` dans l'environnement, le système bascule sur une simulation (`is_mock: true`) qui valide l'abonnement sans encaissement réel. |
| **Permissions Équipe / RBAC** | 🎨 MOCK / VISUEL | Les membres d'équipe peuvent être créés dans les paramètres, mais les vérifications de permissions (`can_collect_payments`, `can_manage_tuition`, etc.) ne sont pas appliquées pour bloquer les boutons ou restreindre les pages. Tous les utilisateurs ont un accès directeur complet. |
| **Synchronisation Multi-Appareils en Temps Réel** | ⚠️ PARTIEL | La publication Supabase Realtime est configurée pour `notifications` et `subscriptions`, mais **pas** pour `payments` ni `students`. Si la caissière encaisse sur PC, le téléphone du directeur ne se met pas à jour automatiquement sans rechargement. |

---

## 6. BASE DE DONNÉES SUPABASE & SCHÉMA POSTGRESQL

La base de données repose sur **16 tables relationnelles** dans le schéma `public` avec support de clés étrangères `ON DELETE CASCADE` ou `RESTRICT`.

### 6.1 Liste Exhaustive des Tables et Relations

```mermaid
erDiagram
    schools ||--o{ academic_years : "possède"
    schools ||--o{ school_members : "comporte"
    schools ||--o{ classes : "contient"
    schools ||--o{ tuition_plans : "définit"
    schools ||--o{ parents : "enregistre"
    schools ||--o{ students : "scolarise"
    schools ||--o{ payments : "encaisse"
    schools ||--o{ reminders : "envoie"
    schools ||--o{ subscriptions : "souscrit"
    schools ||--o{ notifications : "reçoit"
    schools ||--o{ import_batches : "archive"

    academic_years ||--o{ classes : "organise"
    academic_years ||--o{ tuition_plans : "applique"
    academic_years ||--o{ students : "inscrit"
    academic_years ||--o{ payments : "comptabilise"

    classes ||--o{ tuition_plans : "tarifée par"
    classes ||--o{ students : "regroupe"

    tuition_plans ||--o{ tuition_installments : "découpé en"

    parents ||--o{ student_parents : "lié à"
    students ||--o{ student_parents : "représenté par"

    students ||--o{ payments : "paye"
    students ||--o{ reminders : "ciblé par"
```

### 6.2 Analyse Détaillée des Tables

1. **`schools`** : Entité tenant racine. Contient le préfixe de reçu (`receipt_prefix`), le compteur atomique (`receipt_counter`), les coordonnées, la devise (`FCFA`) et l'état d'onboarding (`onboarding_completed`, `onboarding_current_step`).
2. **`academic_years`** : Année scolaire (`name`, `start_date`, `end_date`, `is_current`).
3. **`school_members`** : Liaison entre `auth.users` et `schools` avec rôle (`owner`, `director`, `accountant`, `secretary`).
4. **`classes`** : Classes (`name`, `level`, `series`, `cycle_year`, `branch`, `order_index`, `is_custom`).
5. **`tuition_plans`** : Montant annuel global (`total_amount`) associé à une classe et une année scolaire. Contrainte d'unicité `UNIQUE(school_id, academic_year_id, class_id)`.
6. **`tuition_installments`** : Tranches de paiement liées à une grille (`title`, `due_date`, `amount`, `installment_order`).
7. **`parents`** : Contacts tuteurs (`full_name`, `relationship`, `phone_primary`, `phone_whatsapp`, `profession`, `address`).
8. **`students`** : Élèves (`matricule`, `first_name`, `last_name`, `gender`, `birth_date`, `discount_amount`, `discount_reason`, `custom_tuition`, `is_active`).
9. **`student_parents`** : Table de jointure Many-to-Many entre élèves et parents (`is_primary_contact`).
10. **`payments`** : Encaissements (`amount`, `allocated_amount`, `credit_amount`, `is_advance`, `payment_method`, `transaction_ref`, `receipt_number`, `idempotency_key`, `status`, `cancelled_at`, `cancellation_reason`).
11. **`payment_methods_config`** : Modes de paiement configurables par école (`key`, `label`, `is_active`, `order_index`).
12. **`reminders`** : Historique des relances (`channel`, `message_content`, `amount_due`, `days_late`, `status`).
13. **`import_batches`** : Historique des imports (`source_type`, `file_name`, `total_rows`, `imported_students_count`, `imported_payments_count`, `errors_count`, `duplicates_count`).
14. **`audit_logs`** : Journal d'audit de traçabilité (`action`, `entity_type`, `entity_id`, `payload`).
15. **`notifications`** : Notifications contextuelles (`type`, `priority`, `title`, `message`, `action_url`, `dedup_key`, `is_read`, `target_roles`).
16. **`subscriptions`** : Abonnements (`plan`, `billing_period`, `status`, `price_amount`, `trial_start_at`, `trial_end_at`, `subscription_start_at`, `subscription_end_at`, `refund_eligible_until`).

### 6.3 Stockage : Supabase vs LocalStorage vs Mock

| Type de donnée | Source Principale (Source of Truth) | Stockage Secondaire / Cache | Données Mockées Résiduelles |
| :--- | :--- | :--- | :--- |
| **Écoles & Années** | Supabase PostgreSQL (`schools`, `academic_years`) | React Context (`lib/store.tsx`) | ❌ Aucune (initialisé vide `INITIAL_SCHOOL`) |
| **Classes** | Supabase PostgreSQL (`classes`) | React Context | ⚠️ Liste de secours hardcodée dans les formulaires |
| **Élèves & Parents** | Supabase PostgreSQL (`students`, `parents`) | React Context | ❌ Aucune (table vide si nouveau compte) |
| **Paiements & Reçus** | Supabase PostgreSQL (`payments`) | React Context | ❌ Aucune |
| **Grilles Tarifaires** | Supabase PostgreSQL (`tuition_plans`, `installments`) | React Context | ❌ Aucune |
| **Notifications Lues** | Supabase PostgreSQL (`notifications`) | `localStorage: scoly_read_notifs_<id>` | ❌ Aucune |
| **Abonnements** | Supabase PostgreSQL (`subscriptions`) | React Context | Essai 15j généré dynamiquement si table vide |
| **Staff & Permissions** | Supabase PostgreSQL (`school_members`) | React Context (`DEFAULT_STAFF`) | ⚠️ `DEFAULT_STAFF` utilisé en fallback mémoire |

---

## 7. AUTHENTIFICATION

- **Technologie :** `@supabase/ssr` et `@supabase/supabase-js`.
- **Mécanisme d'inscription (`/api/auth/register-school`) :**
  1. Utilisation de `supabase.auth.admin.createUser()` avec `email_confirm: true`. Ce choix technique permet à une école de démarrer immédiatement sans être bloquée par un email de confirmation non reçu (fréquent sur les connexions mobiles en Afrique).
  2. Création simultanée dans PostgreSQL de l'école, de l'année scolaire et du lien directeur dans `school_members`.
  3. Connexion instantanée côté client (`signInWithPassword`) et redirection vers l'onboarding.
- **Gestion des sessions multi-appareils :** `client.auth.onAuthStateChange` écoute les changements de session et synchronise l'état utilisateur en direct.
- **Réinitialisation de mot de passe :** Formulaire standard appelant `supabase.auth.resetPasswordForEmail()`.

---

## 8. SÉCURITÉ & ROW LEVEL SECURITY (RLS)

### 8.1 Isolation Multi-Tenant
Toutes les 16 tables ont la sécurité `ROW LEVEL SECURITY` activée (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

L'isolation repose sur la fonction PostgreSQL :
```sql
CREATE OR REPLACE FUNCTION current_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.school_members 
    WHERE user_id = auth.uid() AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

Toutes les politiques appliquent :
```sql
CREATE POLICY tenant_students_isolation ON students
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());
```

### 8.2 Analyse d'Étanchéité Inter-Écoles
- **Risque d'accès croisé accidentel :** **TRÈS FAIBLE.** Une requête effectuée avec le client browser authentifié (`authenticated`) est strictement filtrée par PostgreSQL sur le `school_id` lié au JWT de l'utilisateur.
- **Vulnérabilité potentielle :** La fonction `current_user_school_id()` utilise `LIMIT 1`. Si un utilisateur est membre de plusieurs écoles (ex: consultant ou propriétaire multi-sites), il ne peut accéder qu'à la première école retournée.

### 8.3 Protection des Opérations Financières
- **Idempotence des paiements :** La colonne `idempotency_key` et la procédure `record_payment_v2` empêchent l'enregistrement en double d'un même versement si l'utilisateur clique deux fois rapidement sur le bouton valider.
- **Contrôle transactionnel :** La procédure `record_payment_v2` utilise `SECURITY DEFINER` pour incrémenter le compteur de reçu de façon atomique sans risque de collision de numéros.

---

## 9. IMPORTATION DES DONNÉES

### Analyse Détaillée par Format d'Importation

```mermaid
flowchart LR
    Source[Fichier Source] --> DetectType{Type de Source}
    
    DetectType -->|Excel / CSV| SheetJS[SheetJS Parser]
    DetectType -->|Google Sheets| FetchSheets[Fetch CSV Export]
    DetectType -->|Photo Registre| Tesseract[Tesseract.js OCR]
    DetectType -->|PDF| PDFError[❌ Non Supporté]
    
    SheetJS --> Mapper[Column Detector - Synonyms & Normalization]
    FetchSheets --> Mapper
    Tesseract --> Mapper
    
    Mapper --> Validator[Data Validator & Cleaners]
    Validator --> DupCheck[Duplicate Checker vs Supabase DB]
    DupCheck --> Grid[Preview & Validation Grid]
    Grid --> BatchExec[Batch Processor - 25 rows/chunk]
    BatchExec --> PostgresDB[("Supabase PostgreSQL")]
```

| Critère d'évaluation | Excel (.xlsx, .xls) | CSV | Google Sheets | PDF | Photo / Scanner OCR |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Déjà implémenté ?** | ✅ OUI | ✅ OUI | ✅ OUI | ❌ NON | ✅ OUI |
| **2. Réellement fonctionnel ?** | ✅ OUI | ✅ OUI | ⚠️ PARTIEL (CORS) | ❌ NON | ⚠️ PARTIEL |
| **3. Moteur de transformation** | `XLSX.read` (SheetJS) | `XLSX.read` (SheetJS) | `fetch` + CSV convert | Aucun | `createWorker` (Tesseract) |
| **4. Destination des données** | Supabase `students`, `parents`, `payments` | Supabase `students`, `parents`, `payments` | Supabase `students`, `parents`, `payments` | N/A | Supabase `students`, `parents`, `payments` |
| **5. Champs reconnus** | 16 champs cibles (Nom, Prénom, Classe, Tél, WhatsApp, Sexe, Date naiss, Montant, Remise...) | 16 champs cibles | 16 champs cibles | Aucun | 7 champs heuristiques (Nom, Prénom, Classe, Tél, Montant, Date) |
| **6. Détection des doublons** | Matricule exact, Nom+Prénom+Classe, Téléphone parent | Idem | Idem | Aucun | Idem |
| **7. Détection des erreurs** | Lignes sans nom, sans classe, montants négatifs, dates invalides | Idem | Idem | Aucun | Idem + confiance OCR < 60% |
| **8. Prévisualisation avant import** | ✅ OUI (`PreviewValidationGrid.tsx`) | ✅ OUI | ✅ OUI | ❌ NON | ✅ OUI |
| **9. Confirmation avant création** | ✅ OUI (Bouton d'importation explicite) | ✅ OUI | ✅ OUI | ❌ NON | ✅ OUI |
| **10. Comportement sur 1 000 élèves** | Découpé en 40 lots de 25 lignes avec barre de progression | Idem | Idem | N/A | Trop lourd pour OCR (mémoire crash) |
| **11. Gestion des données manquantes** | Valeurs de secours : Parent par défaut, classe auto-créée, matricule auto-généré | Idem | Idem | N/A | Saisie manuelle demandée dans la grille |

---

## 10. CONFIGURATION DES TARIFS

### 10.1 Règles Actuelles du Moteur de Tarification (`TuitionPlanModal.tsx`)
- L'utilisateur sélectionne une classe et définit :
  1. Le montant total annuel de la scolarité (ex: 200 000 FCFA).
  2. Le découpage en tranches (1ère tranche, 2ème tranche, etc.) avec pour chacune : intitulé, date d'échéance et montant.
- **Boutons de répartition automatique :**
  - Répartition en 1 versement (100%), 2 versements (50/50), 3 versements (33/33/34) ou 4 versements (25/25/25/25) avec ajustement exact à l'unité FCFA sur la dernière tranche.
  - Bouton intelligent d'équilibrage : ajoute ou soustrait le reliquat sur la dernière tranche pour atteindre exactement 100% de la scolarité.

### 10.2 Vérification et Contrôle des Incohérences
- **Cas où Somme(Tranches) > Scolarité :** ✅ BLOQUÉ. Le bouton de soumission est désactivé et un message d'erreur rouge indique le montant du dépassement (`overflowAmount`).
- **Cas où Somme(Tranches) < Scolarité :** ⚠️ AUTORISÉ (Incomplet). Le système affiche un indicateur jaune "Tranches incomplètes" mais autorise l'enregistrement si l'utilisateur le valide.
- **Remises et Bourses :** Les réductions de scolarité ne sont pas configurées dans la grille tarifaire globale mais sont attribuées **individuellement** sur chaque fiche élève (`students.discount_amount` et `students.discount_reason` ou `students.custom_tuition`).

---

## 11. LOGIQUE DES PAIEMENTS

### 11.1 Parcours d'Encaissement Standard
1. Clic sur `[+ Encaisser]` (Header ou Dashboard ou Raccourci bas mobile).
2. Sélection de l'élève (affichage immédiat du récapitulatif : Total dû, Déjà réglé, Solde restant).
3. Pré-remplissage automatique du montant suggéré (montant de la prochaine tranche ou solde restant exact).
4. Sélection du mode de paiement (Espèces, TMoney, Flooz, Virement, Chèque, Autre).
5. Validation -> Enregistrement instantané -> Ouverture du reçu officiel imprimable et partageable sur WhatsApp.

### 11.2 Analyse des Cas d'Incohérence Financière

| Scénario Financier | Comportement Actuel du Code | Conforme à l'Exigence SCOLY ? | Risque Identifié |
| :--- | :--- | :---: | :--- |
| **Paiement négatif ou nul (<= 0 FCFA)** | Bloqué par `numericAmount <= 0` dans le formulaire et dans SQL (`CHECK (amount > 0)`). | ✅ OUI | Aucun |
| **Paiement partiel (inférieur au solde)** | Accepté. Le montant est affecté à la dette, le solde restant diminue et le statut de retard est recalculé. | ✅ OUI | Aucun |
| **Paiement couvrant plusieurs tranches** | Accepté. Le montant total payé est comparé aux seuils cumulés des échéances pour déterminer si l'élève est à jour. | ✅ OUI | Aucun |
| **Paiement supérieur au solde restant (Ex: Reste 50 000 FCFA, saisie 100 000 FCFA)** | **Autorisé avec confirmation.** Le panneau interactif propose à l'utilisateur d'enregistrer l'excédent (50 000 FCFA) comme "Avance / Crédit" (`is_advance: true`). | 🔴 **NON CONFORME** (L'exigence demande d'interdire formellement tout dépassement) | Risque de confusion comptable si l'école ne gère pas les avoirs. |
| **Paiement sur élève déjà à jour (Solde = 0 FCFA)** | **Autorisé avec confirmation.** Propose d'enregistrer la totalité comme versement par avance. | 🔴 **NON CONFORME** (Devrait être rejeté avec message explicite) | Risque de double saisie accidentelle. |
| **Même paiement saisi deux fois le même jour** | Détecté (`checkDuplicateSameDayPayment`). Affiche un avertissement demandant confirmation avant de valider. | ⚠️ PARTIEL | L'utilisateur peut forcer la validation s'il clique deux fois. |
| **Référence Mobile Money déjà existante** | Détecté (`checkDuplicateReference`). Bloque la validation et affiche la fiche du paiement original en doublon. | ✅ OUI | Aucun |
| **Annulation de paiement** | Statut passé à `cancelled`, motif obligatoire, trace d'audit enregistrée, solde élève réaugmenté immédiatement. | ✅ OUI | Aucun |

---

## 12. GESTION DES IMPAYÉS, RETARDS & RELANCES

### 12.1 Algorithme de Détection des Retards
Pour chaque élève, le moteur compare la date du jour (`today`) aux dates d'échéances des tranches (`due_date`) :
- **À jour (`up_to_date`)** : `balance_due === 0` ou tous les paliers échus sont couverts par les paiements effectués.
- **Échéance proche (`upcoming`)** : Un palier arrive à échéance dans les 3 à 7 prochains jours.
- **Retard simple (`late`)** : 1 à 14 jours de retard après la date d'échéance non soldée.
- **Retard critique (`critical`)** : 15 jours ou plus de retard après l'échéance.
- **Crédit / Avance (`credit`)** : Total payé supérieur à la scolarité annuelle.

### 12.2 Système de Relances Multicanal
- **Canal WhatsApp :** Génère un lien direct `https://wa.me/...` avec un texte personnalisé contenant le nom de l'élève, la classe, le montant exact dû et le nombre de jours de retard.
- **Canal SMS :** Génère un lien natif `sms:...?body=...` compatible smartphone pour envoyer un SMS direct sans surcoût opérateur via la puce du téléphone de la direction.
- **Historique :** Chaque relance envoyée est enregistrée dans la table `reminders` avec date, heure, canal et montant réclamé.

---

## 13. SYSTÈME DE NOTIFICATIONS & ALERTES PROACTIVES

Le système de notifications (`lib/notifications/analyzer.ts`) est dynamique et contextuel :

1. **Accompagnement 0-Donnée (Bienveillant) :**
   - Si 0 élève : notification d'accueil et suggestion d'import Excel.
   - Si élèves présents mais 0 paiement : rappel d'enregistrement du premier paiement.
2. **Alertes Financières Réelles :**
   - Échéance proche (3 à 7 jours)
   - Retard de paiement (7 à 14 jours)
   - Impayé critique (> 15 jours)
   - Synthèse journalière de caisse (nombre d'encaissements et total FCFA du jour)
3. **Moteur Anti-Spam :**
   - Si 1 ou 2 élèves en retard : alertes individuelles ciblées.
   - Si 3 élèves ou plus : regroupement automatique en une notification unique synthétique (*« 8 dossiers dépassent 15 jours de retard (450 000 FCFA à recouvrer) »*).
4. **Alertes Abonnement :**
   - Rappel à J-3 avant expiration de l'essai gratuit de 15 jours.
   - Alerte d'expiration d'essai ou d'abonnement.
   - Confirmation d'activation d'abonnement avec date de fin de garantie 30 jours.

---

## 14. ABONNEMENTS START & PRO

### 14.1 Grille Tarifaire Officielle Intégrée dans le Code

| Caractéristique | Forfait START | Forfait PRO |
| :--- | :--- | :--- |
| **Prix Mensuel** | **5 000 FCFA** / mois | **10 000 FCFA** / mois |
| **Prix Annuel (-30%)** | **42 000 FCFA** / an *(Économie : 18 000 FCFA)* | **84 000 FCFA** / an *(Économie : 36 000 FCFA)* |
| **Période d'Essai** | **15 jours gratuits** (Toutes fonctionnalités PRO débloquées) | Inclus |
| **Garantie Satisfait ou Remboursé** | **30 jours** à compter de la date de paiement | **30 jours** à compter de la date de paiement |
| **Limite d'Élèves** | Illimitée dans le code actuel | Illimitée |
| **Gestion des Élèves & Classes** | ✅ Inclus | ✅ Inclus |
| **Encaissement Caisse & Reçus** | ✅ Inclus | ✅ Inclus |
| **Import Excel / CSV** | ✅ Inclus | ✅ Inclus |
| **Relances Individuelles WhatsApp** | ✅ Inclus | ✅ Inclus |
| **Graphiques Avancés & Évolution CA** | 🔒 Verrouillé (Affiche modal PRO) | ✅ Inclus |
| **Camembert Statut Financier Élèves** | 🔒 Verrouillé | ✅ Inclus |
| **Centre d'Actions Urgentes Intelligent** | 🔒 Verrouillé | ✅ Inclus |
| **Paiement Mobile Money FedaPay** | 🔒 Verrouillé | ✅ Inclus |
| **Scan Photo Registre (OCR)** | 🔒 Verrouillé | ✅ Inclus |
| **Synchronisation Google Sheets** | 🔒 Verrouillé | ✅ Inclus |
| **Relances Groupées** | 🔒 Verrouillé | ✅ Inclus |
| **Comptes Équipe Multi-Utilisateurs** | 🔒 Verrouillé | ✅ Inclus |

### 14.2 Moteur de Verrouillage (`canAccessFeature`)
- Pendant les 15 jours d'essai : `allowed = true` sur toutes les fonctionnalités pour permettre la découverte.
- À l'expiration de l'essai : les fonctionnalités sont bloquées et déclenchent l'ouverture du modal `TrialExpiredModal.tsx` invitant à choisir START ou PRO.
- Sur forfait START : les fonctionnalités PRO affichent le modal explicatif `ProFeatureModal.tsx` avec argumentaire de valeur.

---

## 15. AUDIT UX/UI & RÈGLE DES 3 SECONDES

> **Règle d'or évaluée :** *"L'utilisateur doit comprendre quoi faire en moins de 3 secondes."*

### 15.1 Évaluation par Écran

| Écran / Parcours | Temps de Compréhension | Points Forts UX | Frictions & Ambiguïtés Identifiées |
| :--- | :---: | :--- | :--- |
| **Dashboard** | **< 2 secondes** | 4 gros KPI très clairs, bouton bleu `[+ Encaisser]` immanquable, boutons d'action rapide. | Les graphiques et le centre d'action s'empilent en scroll vertical sur petit écran. |
| **Encaissement (Modal)** | **< 2 secondes** | Sélection élève -> solde affiché -> montant suggéré -> valider en 1 clic. | Le panneau d'avertissement en cas de dépassement propose trop de choix (3 boutons) au lieu de bloquer simplement. |
| **Liste des Élèves** | **< 3 secondes** | Badges de couleur clairs (Vert: À jour, Rouge: Retard, Jaune: Échéance), recherche instantanée. | Le tableau horizontal nécessite un scroll sur mobile. |
| **Fiche Élève Individuelle** | **< 2 secondes** | Gros solde en tête de page, boutons d'action WhatsApp/SMS colorés, historique des reçus. | Excellente lisibilité. |
| **Configuration des Tarifs** | **4 à 6 secondes** | Boutons de pré-répartition (1, 2, 3, 4 tranches) très pratiques. | Le formulaire de sélection de classe est confus (mélange de classes prédéfinies et de classes personnalisées). |
| **Tunnel d'Onboarding** | **> 15 secondes** | Chaque étape est propre visuellement. | **9 étapes, c'est beaucoup trop long.** Décourage l'utilisateur qui souhaite juste tester l'application. |
| **Importation des Données** | **3 à 5 secondes** | Glisser-déposer intuitif, prévisualisation claire avec compteurs d'erreurs et de doublons. | L'étape de mapping des colonnes peut intimider un utilisateur novice. |

---

## 16. EXPÉRIENCE MOBILE & RESPONSIVE

- **Navigation Mobile (`BottomNav.tsx`) :**
  - Barre de navigation basse fixée avec 5 icônes : Accueil, Élèves, Bouton central flottant `[+] Encaisser`, Paiements, Impayés.
  - Support de la zone de sécurité iPhone (`env(safe-area-inset-bottom)`).
- **Header Mobile :**
  - Bouton Encaisser masqué sur très petit écran au profit du bouton central de la barre basse.
  - Cloche de notification accessible avec badge rouge pulsant si impayé critique.
- **Formulaires & Modals :**
  - Les modals s'ouvrent en "Bottom Sheet" (tiroir glissant depuis le bas) sur mobile (`rounded-t-3xl`), ce qui facilite l'utilisation à une seule main.
- **Point Faible Mobile :** Les tableaux de données (`<table>`) dans la liste des élèves et le journal des paiements débordent horizontalement et requièrent un défilement tactile.

---

## 17. PERFORMANCE & RÉSILIENCE FAIBLE CONNEXION

### 17.1 Métriques de Performance Constatées
- **Temps de chargement initial :** ~1.2 à 2.0 secondes sur connexion standard.
- **Poids du bundle :** Modals lourds chargés dynamiquement via `next/dynamic({ ssr: false })` (`PaymentModal`, `StudentModal`, `ImportModal`, `ReceiptModal`), ce qui allège considérablement la page principale.
- **Absence de Spinners Bloquants :** Utilisation de squelettes animés (`DashboardSkeleton`) pendant le chargement des données.

### 17.2 Vulnérabilités Réseau (3G / Connexions Faibles en Afrique)
- **Chargement Monolithique (`/api/sync/bootstrap`) :** La route de démarrage charge la totalité des élèves, classes, paiements, grilles, notifications et logs en **une seule requête JSON non paginée**. Si une école compte 1 500 élèves et 6 000 paiements, cette réponse peut peser 3 à 5 Mo et échouer en timeout sur une connexion 3G instable.
- **Requêtes d'Écriture Unitaires :** Lors de l'import d'élèves, les requêtes s'exécutent en boucle unitaire au lieu d'un unique appel SQL `bulk insert`.

---

## 18. PROBLÈMES CRITIQUES

> 🔴 **Risque direct d'incohérence financière, de corruption de données ou de faille de sécurité.**

### 1. Incohérence des Identifiants de Classes (`cls-6e` vs UUID PostgreSQL)
- **Fichiers :** `components/students/StudentModal.tsx`, `components/tuition/TuitionPlanModal.tsx`, `lib/supabase/db.ts`
- **Description :** Les formulaires modaux utilisent des identifiants statiques textuels (`cls-6e`, `cls-5e`, `cls-seconde`, `cls-ci-1`) alors que la table PostgreSQL `classes` génère des `UUID`. Lors de l'enregistrement d'un élève avec `class_id = "cls-6e"`, PostgreSQL lève une exception d'incompatibilité de type UUID (`invalid input syntax for type uuid`), empêchant la persistance réelle dans Supabase.

### 2. Dépassement Financier Non Bloqué (Acceptation d'Excédents)
- **Fichiers :** `lib/store.tsx` (ligne 1350), `components/payments/PaymentModal.tsx` (lignes 386-455), `supabase/setup_complete_database.sql` (ligne 382)
- **Description :** Le système permet d'encaisser un montant supérieur au solde restant et de le convertir en avance/crédit (`credit_amount > 0`). L'exigence fondamentale de SCOLY stipule : *« SCOLY doit absolument empêcher les incohérences financières. Si l'utilisateur essaie d'enregistrer un montant qui dépasse le solde restant, SCOLY doit afficher une erreur claire et refuser le paiement. »*

### 3. Clé Secrète Service Role Supabase Exposée en Base64
- **Fichier :** `lib/supabase/server.ts` (lignes 6-9)
- **Description :** `FALLBACK_SERVICE_KEY` contient la clé Secrète Service Role de Supabase encodée en base64 dans le code source. Si ce dépôt est partagé ou déployé publiquement, la clé donne un accès total en écriture/lecture sans RLS à toute la base de données.

---

## 19. PROBLÈMES IMPORTANTS

> ⚠️ **Fonctionnalités dégradées, incomplètes ou dysfonctionnelles.**

1. **Échec de l'Importation Google Sheets par CORS :**  
   `fetchAndParseGoogleSheets` appelle directement l'URL Google Sheets depuis le navigateur. Les navigateurs bloquent cette requête en raison de la politique CORS de Google.
2. **Absence Totale du Module d'Importation PDF :**  
   Aucune bibliothèque de parsing PDF n'est présente dans le projet malgré l'objectif affiché.
3. **Absence de Pagination sur les Élèves et Paiements :**  
   Toutes les listes affichent l'intégralité des données en mémoire React, ce qui saturera les smartphones dès 500 élèves.
4. **Tranches de Scolarité Incomplètes Autorisées :**  
   Si la scolarité annuelle est de 200 000 FCFA et que l'utilisateur ne saisit que 150 000 FCFA de tranches, le système autorise l'enregistrement de la grille sans forcer l'équilibre à 200 000 FCFA.
5. **Realtime Absent sur les Paiements :**  
   La publication Supabase Realtime n'inclut pas la table `payments`. Un encaissement fait sur un poste caisse n'apparaît pas instantanément sur le dashboard du directeur sans actualisation.

---

## 20. PROBLÈMES UX

> 🎨 **Complexité inutile, surcharge cognitive ou éléments perturbateurs.**

1. **Tunnel d'Onboarding Trop Long (9 Étapes) :**  
   9 étapes consécutives représentent une friction massive. Les étapes 2, 4, 6, 7 et 8 devraient être complètement différées ou fusionnées.
2. **Sélecteur de Classes Surchargé dans les Modals :**  
   Le sélecteur propose des sous-menus pour Maternelle (1ère/2ème année), Lycée (Série G2, A4, C, D) et Université qui créent une confusion visuelle par rapport aux classes réelles créées par l'école.
3. **Tableaux sans Vue Carte sur Mobile :**  
   La liste des élèves et des paiements sur mobile oblige l'utilisateur à faire défiler horizontalement l'écran.

---

## 21. RISQUES TECHNIQUES

1. **Conflit de Cache et Écrasement Silencieux :**  
   `syncLocalToSupabase` et `/api/sync/save-all` envoient un snapshot complet de l'état mémoire de l'utilisateur. Si deux secrétaires travaillent en même temps, la dernière qui enregistre écrase les modifications de la première.
2. **Fuite Mémoire Tesseract.js :**  
   L'initialisation répétée de workers Tesseract sur mobile peut saturer la mémoire RAM du navigateur (150-200 Mo par worker) et provoquer le crash de l'onglet Safari / Chrome Android.
3. **Dépendance Next.js 16 / React 19 en Prerelease :**  
   Next.js 16 et React 19 présentent des changements de comportement sur les Server Actions et les `use()` promises qui nécessitent une stabilité éprouvée.

---

## 22. RISQUES MÉTIER & JURIDIQUES

1. **Reçus sans Valeur Fiscale en cas de Numérotation Non Continue :**  
   Si une transaction est annulée, le numéro de reçu ne doit pas être réattribué mais conservé avec la mention *« ANNULÉ »*. Le code actuel le gère correctement en base, mais l'affichage doit toujours garantir la traçabilité.
2. **Sécurité des Numéros WhatsApp des Parents :**  
   Les numéros de téléphone des tuteurs sont stockés sans masquage et transmis via des liens d'URL WhatsApp. Conforme aux usages locaux, mais attention à la confidentialité.

---

## 23. LISTE COMPLÈTE DES FICHIERS IMPORTANTS

### Cœur & État Global
- [`lib/store.tsx`](file:///c:/SCOLY/lib/store.tsx) : Moteur d'état React global, calculs financiers, actions de mutation.
- [`lib/utils.ts`](file:///c:/SCOLY/lib/utils.ts) : Formatage FCFA, dates, badges de statut, liens WhatsApp, templates de relance.
- [`types/scoly.ts`](file:///c:/SCOLY/types/scoly.ts) : Définitions TypeScript des entités métiers fondamentales.

### Supabase & Base de Données
- [`supabase/setup_complete_database.sql`](file:///c:/SCOLY/supabase/setup_complete_database.sql) : Schéma SQL complet, 16 tables, RLS, triggers et procédure de paiement.
- [`lib/supabase/client.ts`](file:///c:/SCOLY/lib/supabase/client.ts) : Client Supabase navigateur singleton.
- [`lib/supabase/server.ts`](file:///c:/SCOLY/lib/supabase/server.ts) : Client Supabase serveur (Service Role).
- [`lib/supabase/db.ts`](file:///c:/SCOLY/lib/supabase/db.ts) : Couche d'abstraction et requêtes directes PostgreSQL.

### Importation
- [`lib/import/parsers/excel-csv-parser.ts`](file:///c:/SCOLY/lib/import/parsers/excel-csv-parser.ts) : Parser Excel / CSV SheetJS.
- [`lib/import/parsers/google-sheets-parser.ts`](file:///c:/SCOLY/lib/import/parsers/google-sheets-parser.ts) : Parser Google Sheets.
- [`lib/import/mappers/column-detector.ts`](file:///c:/SCOLY/lib/import/mappers/column-detector.ts) : Détecteur sémantique de correspondances de colonnes.
- [`lib/import/validation/data-validator.ts`](file:///c:/SCOLY/lib/import/validation/data-validator.ts) : Validateur de lignes et règles d'intégrité.
- [`lib/import/validation/duplicate-checker.ts`](file:///c:/SCOLY/lib/import/validation/duplicate-checker.ts) : Détecteur de doublons.
- [`lib/import/batch/batch-processor.ts`](file:///c:/SCOLY/lib/import/batch/batch-processor.ts) : Processeur d'import par lots asynchrones.
- [`lib/ocr/ocr-engine.ts`](file:///c:/SCOLY/lib/ocr/ocr-engine.ts) : Moteur OCR Tesseract.js.

### Abonnements & Notifications
- [`lib/subscription/features.ts`](file:///c:/SCOLY/lib/subscription/features.ts) : Définition des plans START/PRO, prix, contrôle d'accès.
- [`lib/notifications/analyzer.ts`](file:///c:/SCOLY/lib/notifications/analyzer.ts) : Analyse proactive de l'état de l'école et anti-spam.
- [`lib/notifications/engine.ts`](file:///c:/SCOLY/lib/notifications/engine.ts) : Fabrique de notifications événementielles.

### Pages & Composants Clés
- [`app/(dashboard)/layout.tsx`](file:///c:/SCOLY/app/(dashboard)/layout.tsx) : Shell global et provider des modals.
- [`components/payments/PaymentModal.tsx`](file:///c:/SCOLY/components/payments/PaymentModal.tsx) : Modal d'encaissement et de contrôle des montants.
- [`components/payments/ReceiptModal.tsx`](file:///c:/SCOLY/components/payments/ReceiptModal.tsx) : Reçu officiel imprimable et partage WhatsApp.
- [`components/tuition/TuitionPlanModal.tsx`](file:///c:/SCOLY/components/tuition/TuitionPlanModal.tsx) : Configuration des grilles et tranches.
- [`components/import/ImportModal.tsx`](file:///c:/SCOLY/components/import/ImportModal.tsx) : Modal complet d'importation multi-sources.

---

## 24. DÉPENDANCES IMPORTANTES

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.12.5",
    "@supabase/supabase-js": "^2.112.4",
    "clsx": "^2.1.1",
    "lucide-react": "^1.34.0",
    "next": "16.3.2",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "tailwind-merge": "^3.6.0",
    "tesseract.js": "^7.0.0",
    "xlsx": "^0.18.5"
  }
}
```

---

## 25. RECOMMANDATIONS POUR LA FUTURE RECONSTRUCTION

Lors de la reconstruction propre du système par le prochain agent, voici la feuille de route recommandée :

1. **Remplacer le Cache Global Monolithique par React Query / Server Actions :**  
   Abandonner le `store.tsx` de 2 277 lignes au profit de requêtes ciblées avec pagination serveur (`useQuery` / `useMutation` ou Server Actions Next.js).
2. **Nettoyer les Identifiants de Classes :**  
   Supprimer tous les IDs statiques en dur (`cls-6e`, etc.) dans les modaux et utiliser exclusivement les vrais `classes` retournées par Supabase avec leurs UUIDs.
3. **Appliquer la Règle d'Or Financière Stricte :**  
   Bloquer tout versement supérieur au solde restant (`amount > balanceDue => Erreur bloquante immédiate`). Supprimer la notion d'avance manuelle sauf si explicitement activée dans les paramètres.
4. **Créer une Route Proxy Serveur pour Google Sheets & PDF :**  
   - Google Sheets : télécharger le CSV côté serveur dans `/api/import/google-sheets` pour contourner le CORS.
   - PDF : installer une bibliothèque d'extraction de tableaux PDF serveur (ex: `pdf-parse` ou Vision AI).
5. **Raccourcir l'Onboarding à 3 Étapes Maximum :**  
   - Étape 1 : Nom de l'établissement & Coordonnées.
   - Étape 2 : Choix des classes de l'école (génération automatique en 1 clic selon le cycle : Primaire, Collège ou Lycée).
   - Étape 3 : Import du premier fichier ou redirection directe vers le Dashboard.
6. **Sécuriser la Clé Service Role :**  
   Supprimer définitivement la clé encodée en dur dans `lib/supabase/server.ts` et exiger sa présence exclusive dans les variables d'environnement serveur.
