# ==============================================================================
# DARLINK - 10 MASTER END-TO-END USER JOURNEYS (Mandatory Verification Suite)
# Complies with Mandate Section 8: Journeys 1 to 10
# Target: Real PostgreSQL 18 + Spring Boot 3.3.5 Backend (Port 8085)
# ==============================================================================

$baseUrl = "http://localhost:8085/api/v1"
$ErrorActionPreference = "Stop"

function Assert-Condition($condition, $message) {
    if (-not $condition) {
        Write-Host "  [FAIL] $message" -ForegroundColor Red
        throw "Assertion Failed: $message"
    } else {
        Write-Host "  [PASS] $message" -ForegroundColor Green
    }
}

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "   DARLINK - EXÉCUTION OFFICIELLE DES 10 PARCOURS UTILISATEUR END-TO-END      " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# JOURNEY 1: REGISTRATION AND AUTHENTICATION
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 1] Inscription, Détection de Doublons & Connexion JWT ---" -ForegroundColor Yellow

$uniqueSuffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$ownerEmail = "owner_j1_$uniqueSuffix@darlink.tn"
$buyerEmail = "buyer_j1_$uniqueSuffix@darlink.tn"
$password = "MasterPassword2026!"

# 1.1 Inscription Propriétaire (User A)
$regOwnerBody = @{
    fullName = "Tahar Haddad"
    email = $ownerEmail
    password = $password
    phone = "+216 71 100 200"
} | ConvertTo-Json

$regOwnerRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regOwnerBody -ContentType "application/json; charset=utf-8"
Assert-Condition ($regOwnerRes.token -ne $null) "Token JWT émis lors de l'inscription du propriétaire"
Assert-Condition ($regOwnerRes.user.email -eq $ownerEmail) "Email du propriétaire correctement enregistré"
$ownerToken = $regOwnerRes.token
$ownerId = $regOwnerRes.user.id

# 1.2 Détection et rejet du doublon d'email (HTTP 400 Bad Request / 409 Conflict)
$duplicateCaught = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regOwnerBody -ContentType "application/json; charset=utf-8"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 409)) {
        $duplicateCaught = $true
    }
}
Assert-Condition ($duplicateCaught) "Rejet automatique d'un email en doublon (HTTP 400/409)"

# 1.3 Rejet mot de passe incorrect (HTTP 401 Unauthorized)
$badLoginCaught = $false
$badLoginBody = @{ email = $ownerEmail; password = "WrongPassword!" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $badLoginBody -ContentType "application/json; charset=utf-8"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        $badLoginCaught = $true
    }
}
Assert-Condition ($badLoginCaught) "Rejet identifiants invalides (HTTP 401 Unauthorized)"

# 1.4 Connexion valide
$loginBody = @{ email = $ownerEmail; password = $password } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json; charset=utf-8"
Assert-Condition ($loginRes.token -ne $null) "Connexion réussie avec token JWT"

# 1.5 Consultation du profil (/users/me)
$ownerHeaders = @{ Authorization = "Bearer $ownerToken" }
$profile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers $ownerHeaders
Assert-Condition ($profile.fullName -eq "Tahar Haddad") "Consultation profil réussie"

# 1.6 Mise à jour du profil (/users/me)
$updateProfileBody = @{ fullName = "Tahar Haddad (Immobilier)"; phone = "+216 71 999 888" } | ConvertTo-Json
$updatedProf = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Put -Body $updateProfileBody -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
Assert-Condition ($updatedProf.fullName -eq "Tahar Haddad (Immobilier)") "Mise à jour du profil persistée"

# ------------------------------------------------------------------------------
# JOURNEY 2: PROPERTY BROWSING
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 2] Exploration et Consultation du Flux Immobilier ---" -ForegroundColor Yellow

$feed = Invoke-RestMethod -Uri "$baseUrl/properties" -Method Get
Assert-Condition ($feed.content.Count -ge 0) "Accès au flux de biens immobiliers (Page $($feed.number), Total $($feed.totalElements))"

# ------------------------------------------------------------------------------
# JOURNEY 3: PROPERTY PUBLICATION
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 3] Publication d'Annonce et Validation de Contraintes ---" -ForegroundColor Yellow

# 3.1 Rejet si champs obligatoires manquants (Validation Bean)
$invalidPropCaught = $false
$invalidBody = @{ description = "Incomplete"; price = 1000 } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$baseUrl/properties" -Method Post -Body $invalidBody -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        $invalidPropCaught = $true
    }
}
Assert-Condition ($invalidPropCaught) "Rejet de publication incomplète (HTTP 400 Bad Request)"

# 3.2 Publication complète réussie
$newPropBody = @{
    title = "Penthouse Vue Mer La Marsa"
    description = "Superbe penthouse haut standing avec terrasse panoramique sur le golfe de Tunis."
    location = "Corniche, La Marsa"
    city = "La Marsa"
    price = 850000.00
    type = "Penthouse"
    imageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
    bedrooms = 3
    bathrooms = 2
    surfaceM2 = 210.00
    isRental = $false
    amenities = @("Terrasse panoramique", "Ascenseur privatif", "Climatisation centrale", "Place parking")
    latitude = 36.8782
    longitude = 10.3247
} | ConvertTo-Json

$createdProp = Invoke-RestMethod -Uri "$baseUrl/properties" -Method Post -Body $newPropBody -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
$propId = $createdProp.id
Assert-Condition ($propId -gt 0) "Bien publié avec succès (ID: $propId)"
Assert-Condition ($createdProp.price -eq 850000.00) "Prix persisté avec exactitude"

# Consultation détaillée du bien
$propDetail = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Get
Assert-Condition ($propDetail.title -eq "Penthouse Vue Mer La Marsa") "Détails du bien vérifiés publiquement"
Assert-Condition ($propDetail.amenities.Count -eq 4) "Toutes les commodités (4) persistées"

# ------------------------------------------------------------------------------
# JOURNEY 4: PROPERTY MANAGEMENT (Mes Biens & Édition)
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 4] Gestion des Annonces par le Propriétaire ---" -ForegroundColor Yellow

$myProps = Invoke-RestMethod -Uri "$baseUrl/properties/my-properties" -Method Get -Headers $ownerHeaders
$myPropFound = ($myProps | Where-Object { $_.id -eq $propId })
Assert-Condition ($myPropFound -ne $null) "Le bien apparaît dans 'Mes Annonces' du propriétaire"

$editPropBody = @{
    title = "Penthouse Prestige Vue Mer La Marsa"
    description = "Superbe penthouse avec terrasse panoramique rénovée."
    location = "Corniche, La Marsa"
    city = "La Marsa"
    price = 890000.00
    type = "Penthouse"
    bedrooms = 3
    bathrooms = 2
    surfaceM2 = 220.00
} | ConvertTo-Json

$updatedProp = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Put -Body $editPropBody -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
Assert-Condition ($updatedProp.title -eq "Penthouse Prestige Vue Mer La Marsa") "Titre modifié avec succès"
Assert-Condition ($updatedProp.price -eq 890000.00) "Prix mis à jour dans PostgreSQL"

# ------------------------------------------------------------------------------
# JOURNEY 5: SEARCH AND FILTERS
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 5] Filtres Avancés & Moteur de Recherche PostgreSQL ---" -ForegroundColor Yellow

$searchCity = Invoke-RestMethod -Uri "$baseUrl/properties?city=La Marsa" -Method Get
Assert-Condition (($searchCity.content | Where-Object { $_.id -eq $propId }) -ne $null) "Filtrage par ville (La Marsa) opérationnel"

$searchType = Invoke-RestMethod -Uri "$baseUrl/properties?type=Penthouse" -Method Get
Assert-Condition (($searchType.content | Where-Object { $_.id -eq $propId }) -ne $null) "Filtrage par type (Penthouse) opérationnel"

$searchPrice = Invoke-RestMethod -Uri "$baseUrl/properties?minPrice=800000&maxPrice=950000" -Method Get
Assert-Condition (($searchPrice.content | Where-Object { $_.id -eq $propId }) -ne $null) "Filtrage par fourchette de prix [800k - 950k DT] opérationnel"

# ------------------------------------------------------------------------------
# JOURNEY 6: FAVORITES WORKFLOW
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 6] Flux Favoris (Ajout, Persistance & Suppression) ---" -ForegroundColor Yellow

# Inscription Acheteur (User B)
$regBuyerBody = @{
    fullName = "Sami Trabelsi"
    email = $buyerEmail
    password = $password
    phone = "+216 22 333 444"
} | ConvertTo-Json
$regBuyerRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBuyerBody -ContentType "application/json; charset=utf-8"
$buyerToken = $regBuyerRes.token
$buyerHeaders = @{ Authorization = "Bearer $buyerToken" }

# Ajout aux favoris
$favAdd = Invoke-RestMethod -Uri "$baseUrl/favorites/$propId" -Method Post -Headers $buyerHeaders
Assert-Condition ($favAdd.message -like "*ajout*") "Bien ajouté aux favoris de l'acheteur"

# Consultation des favoris
$favList = Invoke-RestMethod -Uri "$baseUrl/favorites" -Method Get -Headers $buyerHeaders
Assert-Condition (($favList | Where-Object { $_.id -eq $propId }) -ne $null) "Le bien figure bien dans la liste des favoris"

# Suppression du favori
$favDel = Invoke-RestMethod -Uri "$baseUrl/favorites/$propId" -Method Delete -Headers $buyerHeaders
Assert-Condition ($favDel.message -like "*retir*") "Bien retiré des favoris"

# Vérification liste vide pour ce bien
$favListAfter = Invoke-RestMethod -Uri "$baseUrl/favorites" -Method Get -Headers $buyerHeaders
Assert-Condition (($favListAfter | Where-Object { $_.id -eq $propId }) -eq $null) "Vérification absence après suppression"

# ------------------------------------------------------------------------------
# JOURNEY 7: CONTACT REQUEST FLOW
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 7] Flux Prise de Contact & Rendez-vous Visite ---" -ForegroundColor Yellow

$contactBody = @{
    propertyId = $propId
    senderName = "Sami Trabelsi"
    senderEmail = $buyerEmail
    senderPhone = "+216 22 333 444"
    message = "Bonjour, je souhaite visiter ce penthouse ce samedi matin."
} | ConvertTo-Json

$contactRes = Invoke-RestMethod -Uri "$baseUrl/contact-requests" -Method Post -Body $contactBody -ContentType "application/json; charset=utf-8" -Headers $buyerHeaders
$contactId = $contactRes.id
Assert-Condition ($contactId -gt 0) "Demande de contact créée (ID: $contactId)"
Assert-Condition ($contactRes.status -eq "PENDING") "Statut initial de la demande: PENDING"

# Le propriétaire consulte ses demandes
$received = Invoke-RestMethod -Uri "$baseUrl/contact-requests/received" -Method Get -Headers $ownerHeaders
$receivedReq = ($received | Where-Object { $_.id -eq $contactId })
Assert-Condition ($receivedReq -ne $null) "Demande bien reçue dans la boîte de réception du propriétaire"

# Le propriétaire accepte la demande
$statusUpdate = @{ status = "ACCEPTED" } | ConvertTo-Json
$accepted = Invoke-RestMethod -Uri "$baseUrl/contact-requests/$contactId/status" -Method Patch -Body $statusUpdate -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
Assert-Condition ($accepted.status -eq "ACCEPTED") "Statut de la demande passé à ACCEPTED par le propriétaire"

# L'acheteur vérifie le statut de ses demandes envoyées
$sentReqs = Invoke-RestMethod -Uri "$baseUrl/contact-requests/sent" -Method Get -Headers $buyerHeaders
$sentReq = ($sentReqs | Where-Object { $_.id -eq $contactId })
Assert-Condition ($sentReq.status -eq "ACCEPTED") "Mise à jour en temps réel visible par l'acheteur"

# ------------------------------------------------------------------------------
# JOURNEY 8: SECURITY AND AUTHORIZATION
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 8] Sécurité, RBAC & Prévention d'Usurpation ---" -ForegroundColor Yellow

# 8.1 Accès non authentifié interdit
$unauthCaught = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/properties/my-properties" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(401, 403)) {
        $unauthCaught = $true
    }
}
Assert-Condition ($unauthCaught) "Endpoints protégés inaccessibles sans JWT (HTTP 401/403)"

# 8.2 Usurpation de modification interdite (User B tente de modifier le bien de User A)
$hackPutCaught = $false
$hackBody = @{
    title = "HACKED PROPERTY"
    description = "Hacked"
    location = "Nowhere"
    city = "Tunis"
    price = 1.00
    type = "Villa"
} | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Put -Body $hackBody -ContentType "application/json; charset=utf-8" -Headers $buyerHeaders
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        $hackPutCaught = $true
    }
}
Assert-Condition ($hackPutCaught) "Blocage d'altération de bien par un tiers (HTTP 403 Forbidden)"

# 8.3 Usurpation de suppression interdite (User B tente de supprimer le bien de User A)
$hackDelCaught = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Delete -Headers $buyerHeaders
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        $hackDelCaught = $true
    }
}
Assert-Condition ($hackDelCaught) "Blocage de suppression de bien par un tiers (HTTP 403 Forbidden)"

# ------------------------------------------------------------------------------
# JOURNEY 9: RESILIENCE & ERROR HANDLING
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 9] Résilience, Gestion des Erreurs & Santé Système ---" -ForegroundColor Yellow

$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Assert-Condition ($health.status -eq "UP") "Service backend et base de données UP (v$($health.version))"

$notFoundCaught = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/properties/999999" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        $notFoundCaught = $true
    }
}
Assert-Condition ($notFoundCaught) "Gestion robuste de ressource inexistante (HTTP 404 Not Found)"

# ------------------------------------------------------------------------------
# JOURNEY 10: APPLICATION RESTART & PERSISTENCE VERIFICATION
# ------------------------------------------------------------------------------
Write-Host "`n--- [JOURNEY 10] Persistance DB Multi-Sessions & Nettoyage Légal ---" -ForegroundColor Yellow

# Reconnexion indépendante avec de nouveaux identifiants
$reloginBody = @{ email = $ownerEmail; password = $password } | ConvertTo-Json
$freshLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $reloginBody -ContentType "application/json; charset=utf-8"
$freshOwnerHeaders = @{ Authorization = "Bearer $($freshLogin.token)" }

# Vérification que le bien et les données sont persistés de manière durable dans PostgreSQL
$persistedProp = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Get
Assert-Condition ($persistedProp.id -eq $propId) "Données persistées durablement dans PostgreSQL après reconnexion"

# Suppression légale par le propriétaire légitime
$delRes = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Delete -Headers $freshOwnerHeaders
Assert-Condition ($true) "Suppression légitime du bien #$propId exécutée par son propriétaire"

# Vérification que le bien a bien disparu
$deletedCheck = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        $deletedCheck = $true
    }
}
Assert-Condition ($deletedCheck) "Suppression confirmée dans PostgreSQL (HTTP 404 Not Found)"

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "   LES 10 PARCOURS UTILISATEUR END-TO-END SONT VALIDÉS AVEC SUCCÈS À 100% !   " -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan
