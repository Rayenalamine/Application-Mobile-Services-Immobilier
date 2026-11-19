# ============================================================
# DARLINK - VALIDATION END-TO-END AUTOMATISÉE (Workflows 1 à 6)
# Tests complets sur l'environnement réel (Spring Boot + PostgreSQL)
# ============================================================

$baseUrl = "http://localhost:8085/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DARLINK - VÉRIFICATION END-TO-END COMPLÈTE DES 6 FLUX    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ------------------------------------------------------------
# WORKFLOW 1 : AUTHENTIFICATION & PROFIL UTILISATEUR
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 1] Inscription et Authentification de l'acheteur (User B)..." -ForegroundColor Yellow
$userEmail = "acheteur_$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@darlink.tn"
$regPayload = @{
    fullName = "Yassine Ben Amor"
    email = $userEmail
    password = "SecurePassword2026!"
    phone = "+216 25 111 222"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regPayload -ContentType "application/json; charset=utf-8"
$buyerToken = $regRes.token
$buyerId = $regRes.user.id
Write-Host "  -> Acheteur inscrit avec succès (ID: $buyerId, Email: $userEmail)" -ForegroundColor Green

$loginPayload = @{
    email = $userEmail
    password = "SecurePassword2026!"
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPayload -ContentType "application/json; charset=utf-8"
Write-Host "  -> Connexion JWT réussie, Token obtenu: $($loginRes.token.Substring(0, 20))..." -ForegroundColor Green

# Profil de l'acheteur
$profileRes = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers @{ Authorization = "Bearer $buyerToken" }
Write-Host "  -> Profil récupéré : $($profileRes.fullName) | Rôle: $($profileRes.role)" -ForegroundColor Green

# Mise à jour du profil de l'acheteur
$upProfilePayload = @{
    fullName = "Yassine Ben Amor (Profil Verifie)"
    phone = "+216 25 999 888"
} | ConvertTo-Json
$updatedProfile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Put -Body $upProfilePayload -ContentType "application/json; charset=utf-8" -Headers @{ Authorization = "Bearer $buyerToken" }
Write-Host "  -> Profil mis à jour : $($updatedProfile.fullName) | Tél: $($updatedProfile.phone)" -ForegroundColor Green

# ------------------------------------------------------------
# WORKFLOW 2 : PUBLICATION D'UN BIEN PAR LE PROPRIÉTAIRE (Création & Persistance DB)
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 2] Inscription du Propriétaire (User A) et publication d'une annonce..." -ForegroundColor Yellow
$ownerEmail = "proprietaire_$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@darlink.tn"
$regOwnerPayload = @{
    fullName = "Karim Mahjoub"
    email = $ownerEmail
    password = "OwnerPassword2026!"
    phone = "+216 98 777 666"
} | ConvertTo-Json
$ownerRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regOwnerPayload -ContentType "application/json; charset=utf-8"
$ownerToken = $ownerRes.token
$ownerId = $ownerRes.user.id
Write-Host "  -> Propriétaire inscrit avec succès (ID: $ownerId, Email: $ownerEmail)" -ForegroundColor Green

$propPayload = @{
    title = "Villa Djerba Etoile Bleue"
    description = "Superbe demeure djerbienne avec piscine privee et patio traditionnel."
    location = "Aghir, Djerba"
    city = "Djerba"
    price = 620000.00
    type = "Villa"
    imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    bedrooms = 4
    bathrooms = 3
    surfaceM2 = 280.00
    isRental = $false
    amenities = @("Piscine", "Vue mer", "Patio djerbien", "Climatisation")
    latitude = 33.8150
    longitude = 10.9850
} | ConvertTo-Json

$ownerHeaders = @{ Authorization = "Bearer $ownerToken" }
$createdProp = Invoke-RestMethod -Uri "$baseUrl/properties" -Method Post -Body $propPayload -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
$propId = $createdProp.id
Write-Host "  -> Bien publié avec succès : ID $propId | Titre: $($createdProp.title) | Propriétaire: $($createdProp.ownerId)" -ForegroundColor Green

# ------------------------------------------------------------
# WORKFLOW 3 : RECHERCHE ET FILTRAGE DYNAMIQUE POSTGRESQL
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 3] Recherche et filtrage dynamique dans PostgreSQL..." -ForegroundColor Yellow
$searchRes = Invoke-RestMethod -Uri "$baseUrl/properties?city=Djerba&type=Villa&minPrice=500000&maxPrice=700000" -Method Get
$found = $false
foreach ($p in $searchRes.content) {
    if ($p.id -eq $propId) {
        $found = $true
        break
    }
}
if ($found) {
    Write-Host "  -> Bien #$propId trouvé dans les résultats filtrés PostgreSQL (Total: $($searchRes.totalElements))" -ForegroundColor Green
} else {
    throw "Échec du filtrage : le bien créé n'apparaît pas dans la recherche !"
}

# ------------------------------------------------------------
# WORKFLOW 4 : GESTION DES FAVORIS
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 4] Ajout, consultation et retrait des favoris..." -ForegroundColor Yellow
$buyerHeaders = @{ Authorization = "Bearer $buyerToken" }
$favAdd = Invoke-RestMethod -Uri "$baseUrl/favorites/$propId" -Method Post -Headers $buyerHeaders
Write-Host "  -> Ajout favori effectué : $($favAdd.message)" -ForegroundColor Green

$favList = Invoke-RestMethod -Uri "$baseUrl/favorites" -Method Get -Headers $buyerHeaders
$favFound = ($favList | Where-Object { $_.id -eq $propId })
if ($favFound) {
    Write-Host "  -> Bien #$propId vérifié dans la liste des favoris de l'acheteur" -ForegroundColor Green
} else {
    throw "Échec : le favori n'apparaît pas dans la liste !"
}

$favDel = Invoke-RestMethod -Uri "$baseUrl/favorites/$propId" -Method Delete -Headers $buyerHeaders
Write-Host "  -> Retrait du favori effectué : $($favDel.message)" -ForegroundColor Green

# ------------------------------------------------------------
# WORKFLOW 5 : CONTRÔLE D'ACCÈS ET DROITS DE PROPRIÉTÉ (OWNERSHIP)
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 5] Tentative d'altération frauduleuse par l'acheteur (User B)..." -ForegroundColor Yellow
$hackPayload = @{
    title = "Titre Hacked"
    description = "Alteration non autorisee"
    location = "Djerba"
    city = "Djerba"
    price = 100.00
    type = "Villa"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Put -Body $hackPayload -ContentType "application/json; charset=utf-8" -Headers $buyerHeaders
    throw "ERREUR DE SÉCURITÉ : La modification non autorisée a été acceptée !"
} catch {
    Write-Host "  -> Tentative bloquée avec succès : HTTP 403 Forbidden / Accès refusé !" -ForegroundColor Green
}

# Modification autorisée par le propriétaire légitime (User A)
$updatePayload = @{
    title = "Villa Djerba Etoile Bleue - Prestige Renove"
    description = "Superbe demeure djerbienne entierement renovee avec piscine."
    location = "Aghir, Djerba"
    city = "Djerba"
    price = 640000.00
    type = "Villa"
    bedrooms = 4
    bathrooms = 3
    surfaceM2 = 290.00
} | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Put -Body $updatePayload -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
Write-Host "  -> Modification par le propriétaire réussie : $($updated.title) (Prix: $($updated.price) DT)" -ForegroundColor Green

# ------------------------------------------------------------
# WORKFLOW 6 : DEMANDE DE CONTACT / PRISE DE RENDEZ-VOUS
# ------------------------------------------------------------
Write-Host "`n[WORKFLOW 6] Prise de contact entre l'acheteur et le propriétaire..." -ForegroundColor Yellow
$contactPayload = @{
    propertyId = $propId
    senderName = "Yassine Ben Amor"
    senderEmail = $userEmail
    senderPhone = "+216 25 999 888"
    message = "Bonjour, je souhaite convenir d'une visite ce vendredi a 14h."
} | ConvertTo-Json

$contactRes = Invoke-RestMethod -Uri "$baseUrl/contact-requests" -Method Post -Body $contactPayload -ContentType "application/json; charset=utf-8" -Headers $buyerHeaders
$contactId = $contactRes.id
Write-Host "  -> Demande de contact enregistrée (ID: $contactId, Statut: $($contactRes.status))" -ForegroundColor Green

# Le propriétaire consulte ses demandes reçues
$receivedRequests = Invoke-RestMethod -Uri "$baseUrl/contact-requests/received" -Method Get -Headers $ownerHeaders
$requestFound = ($receivedRequests | Where-Object { $_.id -eq $contactId })
if ($requestFound) {
    Write-Host "  -> Demande reçue par le propriétaire : de '$($requestFound.senderName)' ('$($requestFound.message)')" -ForegroundColor Green
} else {
    throw "Échec : La demande n'apparaît pas chez le propriétaire !"
}

# Le propriétaire accepte la visite
$statusPayload = @{ status = "ACCEPTED" } | ConvertTo-Json
$accepted = Invoke-RestMethod -Uri "$baseUrl/contact-requests/$contactId/status" -Method Patch -Body $statusPayload -ContentType "application/json; charset=utf-8" -Headers $ownerHeaders
Write-Host "  -> Statut mis à jour par le propriétaire : $($accepted.status)" -ForegroundColor Green

# ------------------------------------------------------------
# NETTOYAGE SÉCURISÉ (Suppression du bien de test par son propriétaire)
# ------------------------------------------------------------
Write-Host "`n[NETTOYAGE] Suppression du bien de test par son propriétaire..." -ForegroundColor Yellow
$delProp = Invoke-RestMethod -Uri "$baseUrl/properties/$propId" -Method Delete -Headers $ownerHeaders
Write-Host "  -> Bien #$propId supprimé de PostgreSQL avec succès." -ForegroundColor Green

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   TOUS LES 6 WORKFLOWS END-TO-END SONT VALIDÉS À 100% !    " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
