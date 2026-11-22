# ============================================================
# DARLINK V9 — MASTER ACCEPTANCE & END-TO-END VERIFICATION
# ============================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8085/api/v1"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DARLINK V9 : VERIFICATION DES CORRECTIFS ACCEPTATION     " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# 1. Vérification santé backend & PostgreSQL
Write-Host "[ETAPE 1] Vérification de la santé backend & base PostgreSQL..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8085/actuator/health" -Method Get
if ($health.status -ne "UP" -or $health.components.db.status -ne "UP") {
    Write-Error "Backend ou base de données PostgreSQL non UP !"
}
Write-Host "  -> Backend & PostgreSQL 18 : UP" -ForegroundColor Green

# 2. Scénario A : Inscription et Connexion Utilisateur A
Write-Host "`n[ETAPE 2] Scénario A : Authentification Utilisateur A..." -ForegroundColor Yellow
$emailA = "user_a_v9_$(Get-Random)@darlink.tn"
$pwd = "SecurePassword2026!"
$bodyRegA = @{
    fullName = "Utilisateur A V9"
    email = $emailA
    password = $pwd
    role = "CLIENT"
} | ConvertTo-Json

$regA = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyRegA -ContentType "application/json"
$tokenA = $regA.token
Write-Host "  -> Utilisateur A connecté (ID: $($regA.user.id), Email: $emailA)" -ForegroundColor Green

# 3. Scénario B & C : Utilisateur A ajoute un bien en favori (Property ID: 1)
Write-Host "`n[ETAPE 3] Scénario B & C : Utilisateur A ajoute le bien 1 aux favoris..." -ForegroundColor Yellow
$headersA = @{ Authorization = "Bearer $tokenA" }
$addFavA = Invoke-RestMethod -Uri "$baseUrl/favorites/1" -Method Post -Headers $headersA -ContentType "application/json" -Body "{}"
Write-Host "  -> Réponse ajout : $($addFavA.message)" -ForegroundColor Green

$idsA = Invoke-RestMethod -Uri "$baseUrl/favorites/ids" -Method Get -Headers $headersA
if (-not ($idsA -contains 1)) {
    Write-Error "Le bien 1 n'apparaît pas dans les favoris de l'Utilisateur A !"
}
Write-Host "  -> Favoris Utilisateur A confirmés : $($idsA -join ', ')" -ForegroundColor Green

# 4. Scénario D & E : Déconnexion Utilisateur A & Connexion Utilisateur B (Test d'isolation stricte)
Write-Host "`n[ETAPE 4] Scénario D & E : Connexion Utilisateur B & Test d'isolation stricte..." -ForegroundColor Yellow
$emailB = "user_b_v9_$(Get-Random)@darlink.tn"
$bodyRegB = @{
    fullName = "Utilisateur B V9"
    email = $emailB
    password = $pwd
    role = "CLIENT"
} | ConvertTo-Json

$regB = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $bodyRegB -ContentType "application/json"
$tokenB = $regB.token
$headersB = @{ Authorization = "Bearer $tokenB" }
Write-Host "  -> Utilisateur B connecté (ID: $($regB.user.id), Email: $emailB)" -ForegroundColor Green

$idsB = Invoke-RestMethod -Uri "$baseUrl/favorites/ids" -Method Get -Headers $headersB
if ($idsB -contains 1) {
    Write-Error "VIOLATION D'ISOLATION : Les favoris de l'Utilisateur A fuitent chez l'Utilisateur B !"
}
Write-Host "  -> Isolation validée : Utilisateur B a 0 favoris de l'Utilisateur A (Total: $($idsB.Count))" -ForegroundColor Green

# 5. Scénario F : Utilisateur B ajoute le bien 2 aux favoris
Write-Host "`n[ETAPE 5] Scénario F : Utilisateur B ajoute le bien 2 aux favoris..." -ForegroundColor Yellow
$addFavB = Invoke-RestMethod -Uri "$baseUrl/favorites/2" -Method Post -Headers $headersB -ContentType "application/json" -Body "{}"
$idsBUpdated = Invoke-RestMethod -Uri "$baseUrl/favorites/ids" -Method Get -Headers $headersB
if (-not ($idsBUpdated -contains 2) -or ($idsBUpdated -contains 1)) {
    Write-Error "Échec persistance favori Utilisateur B ou fuite de données !"
}
Write-Host "  -> Favoris Utilisateur B confirmés : $($idsBUpdated -join ', ')" -ForegroundColor Green

# 6. Scénario G : Reconnexion Utilisateur A et vérification d'étanchéité
Write-Host "`n[ETAPE 6] Scénario G : Reconnexion Utilisateur A et vérification d'étanchéité..." -ForegroundColor Yellow
$idsARecheck = Invoke-RestMethod -Uri "$baseUrl/favorites/ids" -Method Get -Headers $headersA
if (-not ($idsARecheck -contains 1) -or ($idsARecheck -contains 2)) {
    Write-Error "Échec de cohérence : les favoris de l'Utilisateur A ont été altérés !"
}
Write-Host "  -> Étanchéité absolue confirmée : Utilisateur A possède uniquement [$($idsARecheck -join ', ')]" -ForegroundColor Green

# 7. Scénario H : Vérification des numéros de téléphone réels des propriétaires
Write-Host "`n[ETAPE 7] Scénario H : Vérification des numéros de téléphone propriétaires..." -ForegroundColor Yellow
$res = Invoke-RestMethod -Uri "$baseUrl/properties?size=50" -Method Get
$allProps = $res.content
Write-Host "  -> Nombre total de biens inspectés : $($allProps.Count)" -ForegroundColor Green

foreach ($p in $allProps) {
    if ([string]::IsNullOrWhiteSpace($p.agentPhone)) {
        Write-Error "Propriété '$($p.title)' (ID: $($p.id)) n'a aucun numéro de téléphone de propriétaire !"
    }
    if ($p.agentPhone -like '*888 999*') {
        Write-Error "Propriété '$($p.title)' (ID: $($p.id)) utilise encore le numéro mock hardcodé +216 71 888 999 !"
    }
    $cleanPhone = $p.agentPhone -replace '[^\d+]',''
    if (-not ($cleanPhone -match '^\+216\d{8}$')) {
        Write-Warning "Format inhabituel pour '$($p.title)' : $($p.agentPhone) (nettoyé: $cleanPhone)"
    }
    Write-Host "  -> Bien '$($p.title)' | Propriétaire: $($p.agentName) | Tel: $($p.agentPhone)" -ForegroundColor Gray
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   TOUS LES CRITÈRES DE VALIDATION V9 SONT RESPECTÉS A 100% " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
