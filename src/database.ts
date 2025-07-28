import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import fs from "fs-extra";
import {
  LinkedInProfile,
  Experience,
  Education,
  Certification,
  Skill,
  Post,
  Connection,
} from "./types.js";

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = "./data/linkedin.db") { // ✅ Cambiado path relativo
    // Ensure data directory exists
    fs.ensureDirSync(path.dirname(dbPath));

    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  private async initTables(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;

    await run(`
      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        headline TEXT,
        summary TEXT,
        location TEXT,
        profileUrl TEXT,
        profilePicture TEXT,
        connectionsCount INTEGER,
        followersCount INTEGER,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS experience (
        id TEXT PRIMARY KEY,
        title TEXT,
        company TEXT,
        companyUrl TEXT,
        location TEXT,
        startDate TEXT,
        endDate TEXT,
        description TEXT,
        skills TEXT, -- JSON array
        current BOOLEAN,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS education (
        id TEXT PRIMARY KEY,
        school TEXT,
        degree TEXT,
        fieldOfStudy TEXT,
        startDate TEXT,
        endDate TEXT,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS certifications (
        id TEXT PRIMARY KEY,
        name TEXT,
        issuingOrganization TEXT,
        issueDate TEXT,
        expirationDate TEXT,
        credentialId TEXT,
        credentialUrl TEXT,
        skills TEXT, -- JSON array
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT,
        endorsements INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        content TEXT,
        publishedAt DATETIME,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        url TEXT,
        imageUrls TEXT, -- JSON array
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        headline TEXT,
        profileUrl TEXT,
        company TEXT,
        location TEXT,
        connectedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getProfile(): Promise<LinkedInProfile | null> {
    const get = promisify(this.db.get.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;
    return (await get(
      "SELECT * FROM profile LIMIT 1"
    )) as LinkedInProfile | null;
  }

  async upsertProfile(
    profile: Omit<LinkedInProfile, "updatedAt">
  ): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;
    await run(
      `
      INSERT OR REPLACE INTO profile 
      (id, firstName, lastName, headline, summary, location, profileUrl, profilePicture, connectionsCount, followersCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        profile.id,
        profile.firstName,
        profile.lastName,
        profile.headline,
        profile.summary,
        profile.location,
        profile.profileUrl,
        profile.profilePicture,
        profile.connectionsCount,
        profile.followersCount,
      ]
    );
  }

  async getExperience(): Promise<Experience[]> {
    const all = promisify(this.db.all.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any[]>;
    const rows = (await all(
      "SELECT * FROM experience ORDER BY startDate DESC"
    )) as any[];
    
    console.error(`🔍 Experience rows found: ${rows.length}`);
    
    return rows.map((row) => ({
      ...row,
      skills: row.skills ? JSON.parse(row.skills) : [],
      current: Boolean(row.current),
      createdAt: new Date(row.createdAt),
    }));
  }

  async insertExperience(experiences: Experience[]): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;

    // Clear existing data
    await run("DELETE FROM experience");

    for (const exp of experiences) {
      await run(
        `
        INSERT INTO experience 
        (id, title, company, companyUrl, location, startDate, endDate, description, skills, current)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          exp.id,
          exp.title,
          exp.company,
          exp.companyUrl,
          exp.location,
          exp.startDate,
          exp.endDate,
          exp.description,
          JSON.stringify(exp.skills || []),
          exp.current,
        ]
      );
    }
  }

  async getCertifications(): Promise<Certification[]> {
    try {
      const all = promisify(this.db.all.bind(this.db)) as (
        sql: string,
        params?: any[]
      ) => Promise<any[]>;
      
      const rows = (await all(
        "SELECT * FROM certifications ORDER BY issueDate DESC"
      )) as any[];
      
      // ✅ Debug mejorado
      console.error(`🏆 Found ${rows.length} certification rows`);
      console.error(`🔍 Sample row:`, rows[0]); // Solo muestra el primero
      
      if (rows.length === 0) {
        console.error(`❌ No certifications found in database`);
        return [];
      }
      
      const processed = rows.map((row, index) => {
        try {
          const certification = {
            ...row,
            skills: row.skills ? JSON.parse(row.skills) : [],
            createdAt: new Date(row.createdAt),
          };
          
          // Debug solo para las primeras 2
          if (index < 2) {
            console.error(`✅ Processed cert ${index}:`, certification.name);
          }
          
          return certification;
        } catch (error) {
          console.error(`❌ Error processing certification ${index}:`, error);
          console.error(`Raw row:`, row);
          return null;
        }
      }).filter(Boolean); // Filtrar nulls
      
      console.error(`✅ Successfully processed ${processed.length} certifications`);
      return processed as Certification[];
      
    } catch (error) {
      console.error(`💥 Database error in getCertifications:`, error);
      throw error;
    }
  }

  async insertCertifications(certifications: Certification[]): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;

    console.error(`📥 Inserting ${certifications.length} certifications`);
    
    await run("DELETE FROM certifications");

    for (const cert of certifications) {
      try {
        await run(
          `
          INSERT INTO certifications 
          (id, name, issuingOrganization, issueDate, expirationDate, credentialId, credentialUrl, skills)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            cert.id,
            cert.name,
            cert.issuingOrganization,
            cert.issueDate,
            cert.expirationDate,
            cert.credentialId,
            cert.credentialUrl,
            JSON.stringify(cert.skills || []),
          ]
        );
        console.error(`✅ Inserted: ${cert.name}`);
      } catch (error) {
        console.error(`❌ Error inserting certification:`, cert.name, error);
        throw error;
      }
    }
  }

  async getSkills(): Promise<Skill[]> {
    const all = promisify(this.db.all.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any[]>;
    const rows = (await all(
      "SELECT * FROM skills ORDER BY endorsements DESC"
    )) as any[];
    
    console.error(`🛠️ Skills rows found: ${rows.length}`);
    
    return rows.map((row) => ({
      ...row,
      featured: Boolean(row.featured),
      createdAt: new Date(row.createdAt),
    }));
  }

  async insertSkills(skills: Skill[]): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;

    await run("DELETE FROM skills");

    for (const skill of skills) {
      await run(
        `
        INSERT INTO skills (id, name, endorsements, featured)
        VALUES (?, ?, ?, ?)
      `,
        [skill.id, skill.name, skill.endorsements, skill.featured]
      );
    }
  }

  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    const all = promisify(this.db.all.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any[]>;
    const rows = (await all(
      "SELECT * FROM posts ORDER BY publishedAt DESC LIMIT ?",
      [limit]
    )) as any[];
    return rows.map((row) => ({
      ...row,
      publishedAt: new Date(row.publishedAt),
      imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : [],
      createdAt: new Date(row.createdAt),
    }));
  }

  async insertPosts(posts: Post[]): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any>;

    for (const post of posts) {
      await run(
        `
        INSERT OR REPLACE INTO posts 
        (id, content, publishedAt, likes, comments, shares, url, imageUrls)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          post.id,
          post.content,
          post.publishedAt.toISOString(),
          post.likes,
          post.comments,
          post.shares,
          post.url,
          JSON.stringify(post.imageUrls || []),
        ]
      );
    }
  }

  async searchConnections(query: string): Promise<Connection[]> {
    const all = promisify(this.db.all.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any[]>;
    const rows = (await all(
      `
      SELECT * FROM connections 
      WHERE firstName LIKE ? OR lastName LIKE ? OR headline LIKE ? OR company LIKE ?
      ORDER BY firstName, lastName
    `,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    )) as any[];

    return rows.map((row) => ({
      ...row,
      connectedAt: row.connectedAt ? new Date(row.connectedAt) : undefined,
      createdAt: new Date(row.createdAt),
    }));
  }

  // ✅ Método de debug añadido
  async debugDatabase(): Promise<void> {
    const all = promisify(this.db.all.bind(this.db)) as (
      sql: string,
      params?: any[]
    ) => Promise<any[]>;
    
    console.error('\n🔍 DATABASE DEBUG INFO:');
    console.error('========================');
    
    try {
      // Check tables exist
      const tables = await all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);
      console.error(`📊 Tables: ${tables.map(t => t.name).join(', ')}`);
      
      // Count rows in each table
      for (const table of tables) {
        const count = await all(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.error(`📈 ${table.name}: ${count[0].count} rows`);
      }
      
      // Sample certification data
      const certSample = await all(`SELECT * FROM certifications LIMIT 3`);
      console.error(`🏆 Sample certifications:`, certSample);
      
    } catch (error) {
      console.error(`💥 Debug error:`, error);
    }
  }

  async close(): Promise<void> {
    const close = promisify(this.db.close.bind(this.db)) as () => Promise<void>;
    await close();
  }
}