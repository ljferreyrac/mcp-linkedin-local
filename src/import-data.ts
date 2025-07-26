import fs from "fs-extra";
import path from "path";
import Papa from "papaparse";
import { Database } from "./database.js";
import {
  LinkedInProfile,
  Experience,
  Certification,
  Skill,
  Post,
} from "./types.js";

export class LinkedInDataImporter {
  private database: Database;

  constructor() {
    this.database = new Database();
  }

  /**
   * Importa desde la exportación oficial de LinkedIn
   * Ve a: Configuración → Privacidad → Obtener una copia de tus datos
   */
  async importFromLinkedInExport(exportPath: string): Promise<void> {
    console.log("📦 Importing from LinkedIn official export...");

    const profilePath = path.join(exportPath, "Profile.csv");
    const positionsPath = path.join(exportPath, "Positions.csv");
    const certificationsPath = path.join(exportPath, "Certifications.csv");
    const skillsPath = path.join(exportPath, "Skills.csv");

    try {
      // Import profile
      if (fs.existsSync(profilePath)) {
        await this.importProfile(profilePath);
      }

      // Import positions
      if (fs.existsSync(positionsPath)) {
        await this.importPositions(positionsPath);
      }

      // Import certifications
      if (fs.existsSync(certificationsPath)) {
        await this.importCertifications(certificationsPath);
      }

      // Import skills
      if (fs.existsSync(skillsPath)) {
        await this.importSkills(skillsPath);
      }

      console.log("✅ Import completed successfully!");
    } catch (error) {
      console.error("❌ Import failed:", error);
      throw error;
    }
  }

  /**
   * Importa datos desde un JSON manual que puedes crear
   */
  async importFromManualJSON(jsonPath: string): Promise<void> {
    console.log("📝 Importing from manual JSON...");

    const data = await fs.readJSON(jsonPath);

    if (data.profile) {
      await this.database.upsertProfile(data.profile);
      console.log("✅ Profile imported");
    }

    if (data.experience) {
      await this.database.insertExperience(data.experience);
      console.log(`✅ Experience imported: ${data.experience.length} items`);
    }

    if (data.certifications) {
      await this.database.insertCertifications(data.certifications);
      console.log(
        `✅ Certifications imported: ${data.certifications.length} items`
      );
    }

    if (data.skills) {
      await this.database.insertSkills(data.skills);
      console.log(`✅ Skills imported: ${data.skills.length} items`);
    }

    if (data.posts) {
      await this.database.insertPosts(data.posts);
      console.log(`✅ Posts imported: ${data.posts.length} items`);
    }
  }

  private async importProfile(csvPath: string): Promise<void> {
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const result = Papa.parse(csvContent, { header: true });

    if (result.data.length > 0) {
      const row = result.data[0] as any;

      const profile: LinkedInProfile = {
        id: "me",
        firstName: row["First Name"] || "",
        lastName: row["Last Name"] || "",
        headline: row["Headline"] || "",
        summary: row["Summary"] || "",
        location: row["Location"] || "",
        profileUrl: row["Public Profile URL"] || "",
        profilePicture: "",
        connectionsCount: parseInt(row["Connections"] || "0"),
        followersCount: parseInt(row["Followers"] || "0"),
        updatedAt: new Date(),
      };

      await this.database.upsertProfile(profile);
      console.log("✅ Profile imported from CSV");
    }
  }

  private async importPositions(csvPath: string): Promise<void> {
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const result = Papa.parse(csvContent, { header: true });

    const experiences: Experience[] = result.data.map(
      (row: any, index: number) => ({
        id: `exp-${index}`,
        title: row["Title"] || "",
        company: row["Company Name"] || "",
        companyUrl: row["Company URL"] || "",
        location: row["Location"] || "",
        startDate: row["Started On"] || "",
        endDate: row["Finished On"] || null,
        description: row["Description"] || "",
        skills: [],
        current: !row["Finished On"],
        createdAt: new Date(),
      })
    );

    await this.database.insertExperience(experiences);
    console.log(`✅ Experience imported: ${experiences.length} positions`);
  }

  private async importCertifications(csvPath: string): Promise<void> {
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const result = Papa.parse(csvContent, { header: true });

    const certifications: Certification[] = result.data.map(
      (row: any, index: number) => ({
        id: `cert-${index}`,
        name: row["Name"] || "",
        issuingOrganization: row["Organization"] || "",
        issueDate: row["Started On"] || "",
        expirationDate: row["Finished On"] || null,
        credentialId: row["License Number"] || "",
        credentialUrl: row["Url"] || "",
        skills: [],
        createdAt: new Date(),
      })
    );

    await this.database.insertCertifications(certifications);
    console.log(
      `✅ Certifications imported: ${certifications.length} certificates`
    );
  }

  private async importSkills(csvPath: string): Promise<void> {
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const result = Papa.parse(csvContent, { header: true });

    const skills: Skill[] = result.data.map((row: any, index: number) => ({
      id: `skill-${index}`,
      name: row["Name"] || "",
      endorsements: parseInt(row["Endorsement Count"] || "0"),
      featured: false,
      createdAt: new Date(),
    }));

    await this.database.insertSkills(skills);
    console.log(`✅ Skills imported: ${skills.length} skills`);
  }

  /**
   * Crea un template JSON para llenar manualmente
   */
  async createManualTemplate(outputPath: string): Promise<void> {
    const template = {
      profile: {
        id: "me",
        firstName: "Tu Nombre",
        lastName: "Tu Apellido",
        headline: "Tu Headline/Título profesional",
        summary: "Tu resumen profesional aquí...",
        location: "Tu ubicación",
        profileUrl: "https://linkedin.com/in/tu-perfil",
        profilePicture: "",
        connectionsCount: 0,
        followersCount: 0,
        updatedAt: new Date(),
      },
      experience: [
        {
          id: "exp-1",
          title: "Título del puesto",
          company: "Nombre de la empresa",
          companyUrl: "",
          location: "Ubicación",
          startDate: "Jan 2023",
          endDate: null, // null si es actual
          description: "Descripción de tus responsabilidades...",
          skills: ["JavaScript", "TypeScript"],
          current: true,
          createdAt: new Date(),
        },
      ],
      certifications: [
        {
          id: "cert-1",
          name: "Nombre del certificado",
          issuingOrganization: "Organización emisora",
          issueDate: "Jan 2023",
          expirationDate: null,
          credentialId: "ID-12345",
          credentialUrl: "https://link-al-certificado.com",
          skills: ["Skill relacionado"],
          createdAt: new Date(),
        },
      ],
      skills: [
        {
          id: "skill-1",
          name: "JavaScript",
          endorsements: 25,
          featured: true,
          createdAt: new Date(),
        },
      ],
      posts: [
        {
          id: "post-1",
          content: "Contenido de tu post...",
          publishedAt: new Date(),
          likes: 10,
          comments: 2,
          shares: 1,
          url: "https://linkedin.com/posts/...",
          imageUrls: [],
          createdAt: new Date(),
        },
      ],
    };

    await fs.writeJSON(outputPath, template, { spaces: 2 });
    console.log(`📝 Template created at: ${outputPath}`);
    console.log("Edit this file with your data and then import it!");
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}
