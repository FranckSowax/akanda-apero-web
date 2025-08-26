/**
 * Script de test pour vérifier la configuration WhatsApp
 * Exécutez avec: npx ts-node scripts/test-whatsapp.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testWhatsAppConfig() {
  console.log('🔍 Vérification de la configuration WhatsApp...\n');
  
  // Vérifier les variables d'environnement
  const requiredVars = [
    'WHAPI_TOKEN',
    'WHAPI_BASE_URL',
    'NEXT_PUBLIC_WHAPI_TOKEN',
    'NEXT_PUBLIC_WHAPI_BASE_URL'
  ];
  
  let allConfigured = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Configuré`);
      if (varName.includes('TOKEN')) {
        console.log(`   Token: ${value.substring(0, 10)}...${value.substring(value.length - 5)}`);
      } else {
        console.log(`   Valeur: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: Non configuré`);
      allConfigured = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allConfigured) {
    console.log('✅ Configuration WhatsApp complète !');
    console.log('\n📱 Prochaines étapes:');
    console.log('1. Redémarrez le serveur: npm run dev');
    console.log('2. Accédez à: http://localhost:3000/admin/whatsapp');
    console.log('3. Testez l\'envoi d\'un message');
  } else {
    console.log('❌ Configuration incomplète');
    console.log('Vérifiez votre fichier .env.local');
  }
}

// Exécuter le test
testWhatsAppConfig().catch(console.error);
