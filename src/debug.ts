#!/usr/bin/env node

import { Database } from './database.js';

async function debugCertifications() {
  const db = new Database();
  
  try {
    console.log('🔍 DEBUGGING CERTIFICATIONS');
    console.log('==========================');
    
    // 1. Debug general de la base de datos
    await db.debugDatabase();
    
    console.log('\n🏆 TESTING getCertifications()');
    console.log('==============================');
    
    // 2. Probar el método que falla
    const certifications = await db.getCertifications();
    
    console.log(`📊 Result length: ${certifications.length}`);
    console.log(`📊 Result type: ${typeof certifications}`);
    console.log(`📊 Is array: ${Array.isArray(certifications)}`);
    
    if (certifications.length > 0) {
      console.log('✅ SUCCESS: Certifications found!');
      console.log('\n📋 First 3 certifications:');
      certifications.slice(0, 3).forEach((cert, index) => {
        console.log(`\n${index + 1}. ${cert.name}`);
        console.log(`   Organization: ${cert.issuingOrganization}`);
        console.log(`   Issue Date: ${cert.issueDate}`);
        console.log(`   Skills: ${cert.skills?.length || 0} skills`);
      });
    } else {
      console.log('❌ PROBLEM: No certifications returned');
      console.log('\n🔍 Let\'s check raw database...');
      
      // Query directo para verificar
      const sqlite3 = require('sqlite3');
      const dbPath = './data/linkedin.db';
      const directDb = new sqlite3.Database(dbPath);
      
      directDb.all('SELECT COUNT(*) as count FROM certifications', (err: any, rows: any) => {
        if (err) {
          console.error('❌ Direct query error:', err);
        } else {
          console.log(`📊 Direct count: ${rows[0].count}`);
        }
        
        if (rows[0].count > 0) {
          directDb.all('SELECT * FROM certifications LIMIT 3', (err2: any, rows2: any) => {
            if (err2) {
              console.error('❌ Direct select error:', err2);
            } else {
              console.log('📋 Direct query results:');
              console.log(rows2);
            }
            directDb.close();
          });
        } else {
          directDb.close();
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Error during debug:', error);
  } finally {
    await db.close();
  }
}

// Run debug
debugCertifications().catch(console.error);