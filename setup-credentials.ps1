# Script de Configuração de Credenciais - ACR Delivery
# Execute: .\setup-credentials.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACR Delivery - Setup de Credenciais" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green
} else {
    Write-Host "✓ Arquivo .env já existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "IMPORTANTE: Você precisa configurar as seguintes credenciais:" -ForegroundColor Yellow
Write-Host ""

# Função para abrir URLs
function Open-URL {
    param($url, $description)
    Write-Host "→ $description" -ForegroundColor Cyan
    Write-Host "  URL: $url" -ForegroundColor Gray
    $response = Read-Host "  Deseja abrir no navegador? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Start-Process $url
        Write-Host "  ✓ Navegador aberto!" -ForegroundColor Green
    }
    Write-Host ""
}

# 1. Supabase
Write-Host "1. SUPABASE (Obrigatório)" -ForegroundColor Yellow
Write-Host "   Você precisa:" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - VITE_SUPABASE_PROJECT_ID" -ForegroundColor Gray
Write-Host "   - VITE_SUPABASE_PUBLISHABLE_KEY" -ForegroundColor Gray
Open-URL "https://supabase.com/dashboard" "Supabase Dashboard"

# 2. Firebase
Write-Host "2. FIREBASE (Obrigatório - Notificações)" -ForegroundColor Yellow
Write-Host "   Você precisa:" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_API_KEY" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_AUTH_DOMAIN" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_PROJECT_ID" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_STORAGE_BUCKET" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_APP_ID" -ForegroundColor Gray
Write-Host "   - VITE_FIREBASE_VAPID_KEY" -ForegroundColor Gray
Open-URL "https://console.firebase.google.com/" "Firebase Console"

# 3. Google Maps
Write-Host "3. GOOGLE MAPS (Obrigatório - Rotas)" -ForegroundColor Yellow
Write-Host "   Você precisa:" -ForegroundColor White
Write-Host "   - VITE_GOOGLE_MAPS_API_KEY" -ForegroundColor Gray
Write-Host "   ATENÇÃO: Requer billing ativo!" -ForegroundColor Red
Open-URL "https://console.cloud.google.com/" "Google Cloud Console"

# 4. Stripe (Opcional)
Write-Host "4. STRIPE (Opcional - Pagamentos)" -ForegroundColor Yellow
Write-Host "   Você precisa:" -ForegroundColor White
Write-Host "   - VITE_STRIPE_PUBLIC_KEY" -ForegroundColor Gray
$response = Read-Host "   Deseja configurar Stripe? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    Open-URL "https://dashboard.stripe.com/" "Stripe Dashboard"
}

# 5. MercadoPago (Opcional)
Write-Host "5. MERCADOPAGO (Opcional - Pagamentos)" -ForegroundColor Yellow
Write-Host "   Você precisa:" -ForegroundColor White
Write-Host "   - VITE_MERCADOPAGO_PUBLIC_KEY" -ForegroundColor Gray
$response = Read-Host "   Deseja configurar MercadoPago? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    Open-URL "https://www.mercadopago.com.br/developers" "MercadoPago Developers"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edite o arquivo .env com suas credenciais" -ForegroundColor White
Write-Host "   → code .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Aplique as migrations no Supabase" -ForegroundColor White
Write-Host "   → Supabase Dashboard > SQL Editor" -ForegroundColor Gray
Write-Host "   → Execute os 6 arquivos .sql em ordem" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Atualize o Service Worker do Firebase" -ForegroundColor White
Write-Host "   → Edite: public/firebase-messaging-sw.js" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Instale as dependências" -ForegroundColor White
Write-Host "   → npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Inicie o projeto" -ForegroundColor White
Write-Host "   → npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Consulte GUIA_CREDENCIAIS.md para instrucoes detalhadas" -ForegroundColor Cyan
Write-Host ""

# Abrir .env no editor
$response = Read-Host "Deseja abrir o arquivo .env agora? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code .env
        Write-Host "Arquivo .env aberto no VS Code!" -ForegroundColor Green
    } else {
        notepad .env
        Write-Host "Arquivo .env aberto no Notepad!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Setup concluido! Boa configuracao!" -ForegroundColor Green
Write-Host ""
