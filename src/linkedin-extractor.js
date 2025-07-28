/**
 * LinkedIn Data Extractor
 * 
 * Ejecuta este script en la consola del navegador (F12) 
 * mientras estés en tu perfil de LinkedIn
 * 
 * Uso:
 * 1. Ve a tu perfil de LinkedIn
 * 2. Abre DevTools (F12)
 * 3. Copia y pega este script en la consola
 * 4. Presiona Enter
 * 5. Copia el JSON que aparece y guárdalo
 */

(function LinkedInExtractor() {
    console.log('🚀 LinkedIn Data Extractor iniciado...');

    const data = {
        profile: {},
        experience: [],
        certifications: [],
        skills: [],
        posts: []
    };

    // Función helper para obtener texto
    function getText(selector, element = document) {
        const el = element.querySelector(selector);
        return el?.textContent?.trim() || '';
    }

    // Función helper para obtener múltiples elementos
    function getElements(selector, element = document) {
        return Array.from(element.querySelectorAll(selector));
    }

    // Extraer perfil básico
    function extractProfile() {
        console.log('👤 Extrayendo perfil...');

        const fullName = getText('h1') || getText('.text-heading-xlarge');
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const headline = getText('.text-body-medium.break-words') ||
            getText('[data-generated-suggestion-target]') ||
            getText('.pv-text-details__left-panel .text-body-medium');

        const location = getText('.text-body-small.inline.t-black--light.break-words') ||
            getText('.pv-text-details__left-panel .text-body-small');

        // Buscar el elemento de conexiones de diferentes formas
        const connectionsElement = document.querySelector('[href*="overlay/connections"]') ||
            document.querySelector('a[href*="/connections/"]') ||
            document.querySelector('.pv-top-card--list-bullet li');

        const connectionsText = connectionsElement?.textContent || '0';
        const connectionsCount = parseInt(connectionsText.replace(/\D/g, '')) || 0;

        const profilePicture = document.querySelector('.pv-top-card-profile-picture img')?.src ||
            document.querySelector('.profile-photo-edit__preview')?.src || '';

        data.profile = {
            id: 'me',
            firstName: firstName || 'Unknown',
            lastName: lastName || '',
            headline: headline || '',
            summary: '', // Esto requiere ir a la sección About
            location: location || '',
            profileUrl: window.location.href,
            profilePicture: profilePicture,
            connectionsCount: connectionsCount,
            followersCount: 0,
            updatedAt: new Date().toISOString()
        };

        console.log('✅ Perfil extraído:', data.profile);
    }

    // Extraer experiencia (funciona mejor en /details/experience/)
    function extractExperience() {
        console.log('💼 Extrayendo experiencia...');

        const experienceElements = getElements('.pvs-list__item--line-separated.pvs-list__item--one-column') ||
            getElements('[data-view-name="profile-component-entity"]') ||
            getElements('.pv-entity__summary-info');

        experienceElements.forEach((element, index) => {
            const title = getText('a[href*="add-edit/POSITION"] .t-bold span[aria-hidden="true"]', element) ||
                getText('.t-bold span[aria-hidden="true"]', element);

            let rawCompany = getText('a[href*="add-edit/POSITION"] .t-14.t-normal span[aria-hidden="true"]', element);
            let company = rawCompany?.split(' · ')[0]?.trim() || '';

            const rawDateRange = getText('.pvs-entity__caption-wrapper', element) || '';
            const [startDate, endDateRaw] = rawDateRange.split(' - ');
            const endDate = endDateRaw?.split('·')[0]?.trim();
            const current = /Presente|Actualidad|Present/i.test(endDateRaw);

            let location = '';
            const allSpans = element.querySelectorAll('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
            allSpans.forEach(span => {
                if (span.textContent.includes('·')) {
                    const parts = span.textContent.split('·');
                    const possibleLocation = parts.find(p => p.includes('Perú') || p.includes('Remote') || p.includes('Presencial'));
                    if (possibleLocation) location = possibleLocation.trim();
                }
            });

            let description = '';
            const liElements = element.querySelectorAll('li');
            liElements.forEach(li => {
                const text = li.textContent || '';
                if (text.includes('•')) {
                    description = text.trim();
                }
            });

            let skills = [];
            liElements.forEach(li => {
                const text = li.textContent || '';
                if (text.includes('Aptitudes:')) {
                    const match = text.match(/Aptitudes:\s*(.+)/i);
                    if (match && match[1]) {
                        skills = match[1].split('·').map(s => s.trim());
                    }
                }
            });

            if (title && company) {
                data.experience.push({
                    id: `exp-${index}`,
                    title,
                    company,
                    companyUrl: '',
                    location,
                    startDate: startDate?.trim() || '',
                    endDate: current ? null : endDate || '',
                    description,
                    skills,
                    current,
                    createdAt: new Date().toISOString()
                });
            }

        });

        console.log(`✅ Experiencia extraída: ${data.experience.length} posiciones`);
    }

    // Extraer certificaciones (funciona mejor en /details/certifications/)
    function extractCertifications() {
        console.log('🏆 Extrayendo certificaciones...');

        const certElements = getElements('.pvs-list__item--line-separated') ||
            getElements('[data-view-name="profile-component-entity"]');

        certElements.forEach((element, index) => {
            const name = getText('a[href*="curso"] .t-bold span[aria-hidden="true"]', element) ||
                getText('.t-bold span[aria-hidden="true"]', element);

            const organization = getText('a[href*="curso"] .t-14.t-normal span[aria-hidden="true"]', element) ||
                getText('.t-14.t-normal span[aria-hidden="true"]', element);

            const dateInfo = getText('.pvs-entity__caption-wrapper', element) ||
                getText('.t-14.t-normal.t-black--light', element);

            const credentialIdMatch = getText('.t-14.t-normal.t-black--light', element)?.match(/([a-f0-9-]{36})/i);
            const credentialId = credentialIdMatch ? credentialIdMatch[1] : null;

            const credentialUrl = element.querySelector('a[href*="diploma"]')?.getAttribute('href') || null;

            // Extraer fecha de expedición
            const issueMatch = dateInfo?.match(/(Expedición|Issued):?\s*(.+?)(?:\s+•|$)/i);
            const issueDate = issueMatch ? issueMatch[2] : '';

            // === FIX a selector no válido ===
            // Buscar aptitudes dentro de los <li>
            const liElements = element.querySelectorAll('li');
            let skills = [];

            liElements.forEach(li => {
                const text = li.textContent || '';
                if (text.includes('Aptitudes:')) {
                    const match = text.match(/Aptitudes:\s*(.+)/i);
                    if (match && match[1]) {
                        skills = match[1].split('·').map(skill => skill.trim());
                    }
                }
            });

            if (name && organization) {
                data.certifications.push({
                    id: `cert-${index}`,
                    name,
                    issuingOrganization: organization,
                    issueDate,
                    expirationDate: null,
                    credentialId,
                    credentialUrl,
                    skills,
                    createdAt: new Date().toISOString()
                });
            }


        });

        console.log(`✅ Certificaciones extraídas: ${data.certifications.length} certificados`);
    }

    // Extraer habilidades (funciona mejor en /details/skills/)
    function extractSkills() {
        console.log('🛠️ Extrayendo habilidades...');

        const skillElements = getElements('.pvs-list__item--line-separated') ||
            getElements('[data-view-name="profile-component-entity"]');

        skillElements.forEach((element, index) => {
            const name = getText('.mr1.t-bold span', element) ||
                getText('span[aria-hidden="true"]', element);

            const endorsementText = getText('.pvs-entity__caption-wrapper', element) ||
                getText('.t-14.t-black--light', element);

            const endorsementMatch = endorsementText.match(/(\d+)\s+endorsement/i) ||
                endorsementText.match(/(\d+)\s+recomendac/i);
            const endorsements = endorsementMatch ? parseInt(endorsementMatch[1]) : 0;

            if (name) {
                data.skills.push({
                    id: `skill-${index}`,
                    name: name,
                    endorsements: endorsements,
                    featured: false, // Sería necesario detectar si está en featured
                    createdAt: new Date().toISOString()
                });
            }
        });

        console.log(`✅ Habilidades extraídas: ${data.skills.length} skills`);
    }

    // Función principal
    function extract() {
        try {
            extractProfile();

            // Solo extraer estas secciones si estamos en las páginas específicas
            const currentUrl = window.location.href;

            if (currentUrl.includes('/details/experience/')) {
                extractExperience();
            } else if (currentUrl.includes('/details/certifications/')) {
                extractCertifications();
            } else if (currentUrl.includes('/details/skills/')) {
                extractSkills();
            } else {
                // En el perfil principal, intentar extraer lo que podamos
                extractExperience();
                extractSkills();
            }

            console.log('🎉 Extracción completada!');
            console.log('📋 Datos extraídos:');
            console.log('─'.repeat(50));
            console.log(JSON.stringify(data, null, 2));
            console.log('─'.repeat(50));
            console.log('💡 Para obtener más datos:');
            console.log('1. Ve a https://linkedin.com/in/me/details/experience/');
            console.log('2. Ve a https://linkedin.com/in/me/details/certifications/');
            console.log('3. Ve a https://linkedin.com/in/me/details/skills/');
            console.log('4. Ejecuta este script en cada página');
            console.log('5. Combina los resultados manualmente');

            // Guardar en localStorage para fácil acceso
            localStorage.setItem('linkedinData', JSON.stringify(data));
            console.log('💾 Datos guardados en localStorage["linkedinData"]');

            return data;

        } catch (error) {
            console.error('❌ Error durante la extracción:', error);
            return null;
        }
    }

    // Ejecutar extracción
    return extract();
})();

// Función helper para recuperar datos guardados
function getLinkedInData() {
    const savedData = localStorage.getItem('linkedinData');
    if (savedData) {
        console.log('📋 Datos guardados encontrados:');
        console.log(JSON.parse(savedData));
        return JSON.parse(savedData);
    } else {
        console.log('❌ No hay datos guardados');
        return null;
    }
}