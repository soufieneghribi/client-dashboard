#!/usr/bin/env node

/**
 * 🔍 Script de Vérification des Optimisations
 * 
 * Ce script vérifie que toutes les optimisations sont bien en place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des Optimisations de Performance\n');

const checks = [];

// 1. Vérifier que React Query est installé
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies['@tanstack/react-query']) {
        checks.push({ name: 'React Query installé', status: '✅' });
    } else {
        checks.push({ name: 'React Query installé', status: '❌' });
    }
} catch (e) {
    checks.push({ name: 'React Query installé', status: '❌' });
}

// 2. Vérifier que performance.css existe
if (fs.existsSync('src/styles/performance.css')) {
    checks.push({ name: 'performance.css créé', status: '✅' });
} else {
    checks.push({ name: 'performance.css créé', status: '❌' });
}

// 3. Vérifier que queryClient.jsx existe
if (fs.existsSync('src/config/queryClient.jsx')) {
    checks.push({ name: 'queryClient.jsx créé', status: '✅' });
} else {
    checks.push({ name: 'queryClient.jsx créé', status: '❌' });
}

// 4. Vérifier que main.jsx contient QueryProvider
try {
    const mainJsx = fs.readFileSync('src/main.jsx', 'utf8');
    if (mainJsx.includes('QueryProvider')) {
        checks.push({ name: 'QueryProvider intégré', status: '✅' });
    } else {
        checks.push({ name: 'QueryProvider intégré', status: '❌' });
    }
} catch (e) {
    checks.push({ name: 'QueryProvider intégré', status: '❌' });
}

// 5. Vérifier que Home.jsx contient le prefetch
try {
    const homeJsx = fs.readFileSync('src/pages/Home/Home.jsx', 'utf8');
    if (homeJsx.includes('prefetchElectronics')) {
        checks.push({ name: 'Prefetch dans Home.jsx', status: '✅' });
    } else {
        checks.push({ name: 'Prefetch dans Home.jsx', status: '❌' });
    }
} catch (e) {
    checks.push({ name: 'Prefetch dans Home.jsx', status: '❌' });
}

// 6. Vérifier que Popular.jsx contient skeleton
try {
    const popularJsx = fs.readFileSync('src/components/Popular.jsx', 'utf8');
    if (popularJsx.includes('skeleton')) {
        checks.push({ name: 'Skeleton loader dans Popular.jsx', status: '✅' });
    } else {
        checks.push({ name: 'Skeleton loader dans Popular.jsx', status: '❌' });
    }
} catch (e) {
    checks.push({ name: 'Skeleton loader dans Popular.jsx', status: '❌' });
}

// 7. Vérifier que UniverseSelector.jsx contient handlePrefetch
try {
    const universeSelectorJsx = fs.readFileSync('src/pages/Home/components/UniverseSelector.jsx', 'utf8');
    if (universeSelectorJsx.includes('handlePrefetch')) {
        checks.push({ name: 'Prefetch au hover', status: '✅' });
    } else {
        checks.push({ name: 'Prefetch au hover', status: '❌' });
    }
} catch (e) {
    checks.push({ name: 'Prefetch au hover', status: '❌' });
}

// 8. Vérifier que Popular.js affiche 12 articles pour électronique
try {
    const popularJs = fs.readFileSync('src/store/slices/Popular.js', 'utf8');
    if (popularJs.includes('slice(0, 12)')) {
        checks.push({ name: '12 articles pour électronique', status: '✅' });
    } else {
        checks.push({ name: '12 articles pour électronique', status: '❌' });
    }
} catch (e) {
    checks.push({ name: '12 articles pour électronique', status: '❌' });
}

// Afficher les résultats
console.log('📋 Résultats:\n');
checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
});

const passed = checks.filter(c => c.status === '✅').length;
const total = checks.length;

console.log(`\n📊 Score: ${passed}/${total} (${Math.round(passed / total * 100)}%)\n`);

if (passed === total) {
    console.log('🎉 Toutes les optimisations sont en place !');
    console.log('🚀 Votre application est prête pour des performances optimales.\n');
} else {
    console.log('⚠️  Certaines optimisations sont manquantes.');
    console.log('📖 Consultez SOLUTION_FINALE_PERFORMANCE.md pour plus de détails.\n');
}
