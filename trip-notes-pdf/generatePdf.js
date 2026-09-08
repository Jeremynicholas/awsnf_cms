// functions/routes/generatePdf.js
import puppeteer from 'puppeteer';
import { Router } from 'express';
import { formatDate } from '../functions/utils/formatDate.js';
import fs from 'fs/promises';

const router = Router();

function fmt(date) {
  if (!date) return '';
  try { return formatDate(date); } catch { return date; }
}

function buildTripHtml(trip) {
  const ICON_CALENDAR = `<svg xmlns="http://www.w3.org/2000/svg" class="icons" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 14a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" fill-rule="evenodd" d="M7 1.75a.75.75 0 0 1 .75.75v.763c.662-.013 1.391-.013 2.193-.013h4.113c.803 0 1.532 0 2.194.013V2.5a.75.75 0 0 1 1.5 0v.827q.39.03.739.076c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433v2.112c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H9.945c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433v-2.112c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238q.35-.046.739-.076V2.5A.75.75 0 0 1 7 1.75M5.71 4.89c-1.005.135-1.585.389-2.008.812S3.025 6.705 2.89 7.71q-.034.255-.058.539h18.336q-.024-.284-.058-.54c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.027-.138-2.382-.14-4.289-.14h-4c-1.907 0-3.261.002-4.29.14M2.75 12c0-.854 0-1.597.013-2.25h18.474c.013.653.013 1.396.013 2.25v2c0 1.907-.002 3.262-.14 4.29c-.135 1.005-.389 1.585-.812 2.008s-1.003.677-2.009.812c-1.027.138-2.382.14-4.289.14h-4c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812s-.677-1.003-.812-2.009c-.138-1.027-.14-2.382-.14-4.289z" clip-rule="evenodd"/></svg>`;
  const ICON_ACCOMMODATION = `<svg xmlns="http://www.w3.org/2000/svg" class="icons" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 20.75v-10c2.809-1.248 4.986-2.583 7-5c2.014 2.417 4.191 3.752 7 5v10m-14 0H3m2 0h2.5m11.5 0h2m-2 0h-2.5m-9 0h9m-9 0c2.586-2.586 4.031-5.406 4.5-9c.469 3.594 1.914 6.414 4.5 9M6 10V3.5m-2 .783l1.553-.69a1.12 1.12 0 0 1 .894 0L8 4.284M4 6.948l1.553-.69c.281-.125.613-.125.894 0L8 6.948M18 10V5m0 0c-.153 0-.306.031-.447.094L16 5.784M18 5c.153 0 .306.031.447.094l1.553.69"/></svg>`;

  const ICON_ITINERARY = `<svg xmlns="http://www.w3.org/2000/svg" class="icons" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M22 10v-.783c0-1.94 0-2.909-.586-3.512c-.586-.602-1.528-.602-3.414-.602h-2.079c-.917 0-.925-.002-1.75-.415L10.84 3.021c-1.391-.696-2.087-1.044-2.828-1.02S6.6 2.418 5.253 3.204l-1.227.716c-.989.577-1.483.866-1.754 1.346C2 5.746 2 6.33 2 7.499v8.217c0 1.535 0 2.303.342 2.73c.228.285.547.476.9.54c.53.095 1.18-.284 2.478-1.042c.882-.515 1.73-1.05 2.785-.905c.884.122 1.705.68 2.495 1.075"/><path stroke-linejoin="round" stroke-width="1.5" d="M8 2v15"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v4.5"/><path stroke-width="1.5" d="M18.308 21.684A1.18 1.18 0 0 1 17.5 22c-.302 0-.591-.113-.808-.317c-1.986-1.87-4.646-3.96-3.349-6.993C14.045 13.05 15.73 12 17.5 12s3.456 1.05 4.157 2.69c1.296 3.03-1.358 5.13-3.349 6.993Z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 16.5h.009"/></g></svg>`;

  const departures = (trip.departures || []);
  const departureDisplay = departures.length === 1
    ? fmt(departures[0].date) || departures[0].label
    : departures.map(d => d.label || fmt(d.date)).filter(Boolean).join(' · ');


  const days = (trip.days || []).map(d => `
    <div class="day">
      ${d.image ? `
        <div class="day_image">
          <img src="${d.image}" />
        </div>` : ''}

      <div class="day-header">
        <h3>Day ${d.day}</h3>
        ${fmt(d.date) ? `
          <div class="icon_wrapper">
            ${ICON_CALENDAR}
            <span>${fmt(d.date)}</span>
          </div>` : ''}
        ${d.location ? `<span class="location-tag">${d.location}</span>` : ''}
      </div>

      ${d.title ? `<p><strong>${d.title}</strong></p>` : ''}
      ${d.description ? `<p>${d.description}</p>` : ''}
      ${d.accommodation ? `
        <div class="icon_wrapper">
          ${ICON_ACCOMMODATION}
          <span class="accommodation">${d.accommodation}</span>
        </div>` : ''}
      ${d.meals ? `<p><strong>Meals:</strong> ${d.meals}</p>` : ''}
    </div>
  `).join('');

  const inclusions = (trip.inclusions || trip.inclusionsString?.split('\n').filter(Boolean) || [])
    .map(i => `<li>${i}</li>`).join('');

  const exclusions = (trip.exclusions || trip.exclusionsString?.split('\n').filter(Boolean) || [])
    .map(e => `<li>${e}</li>`).join('');

  const notes = (trip.notes || []).map(n => `
  <div class="note-section">
    ${n.heading ? `<h2>${n.heading}</h2>` : ''}
    ${n.image ? `
      <div class="note_image">
        <img src="${n.image}" />
      </div>` : ''}
    ${n.body ? `<div class="rich-content">${n.body}</div>` : ''}
  </div>
`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
    <title>${trip.title || 'Trip Notes'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
  size: A4;
  margin: 20mm;

  @bottom-center {
    content: "www.africanwildlifesafaris.com  |  1300 363 302";
    font-size: 9pt;
    color: #888;
    border-top: 1px solid #eee;
    padding-top: 4px;
  }
}

@page :first {
  margin: 0;

  @bottom-center {
    content: none;
  }
}

  body {
    font-family: Calibri Light;
    font-size: 11pt;
    color: #222;
    line-height: 1.6;
    padding-bottom: 10mm;
  }


  h2 {
    font-family: Montserrat Medium;
    font-size: 23pt;
  }

  .page_content {
    padding-top: 20mm;
  }

    /* ---- HEADER ---- */
    header {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
    }
      
    header img {
      max-width: 200px;
    }

    /* ---- HERO ---- */
    .hero_container {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      page-break-after: always;
    }

    .hero_container .bg-full {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero_container::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0,0,0,0.3),
        transparent
      );
      z-index: 1;
    }

    .hero_overview {
      position: absolute;
      top: 20mm;
      left: 20mm;
      right: 20mm;
      display: grid;
      max-width: 400px;
      z-index: 2;
  }

    .hero_logo {
      display: flex;
    }

    .hero_logo img {
      max-width: 200px;
    }

    .hero_overview h1 {
      font-family: Montserrat, sans-serif;
      font-size: 32pt;
      font-weight: 700;
      margin-bottom: 12px;
      color: white;
    }

    .hero_overview span {
      font-family: Montserrat, sans-serif;
      color: white;
      font-size: 16pt;
    }

    .hero_icons {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
    }


    .trip_overview {
      margin-bottom: 48px;
    }

    /* ---- DAYS ---- */
    .trip_days {
      margin-bottom: 48px;
    }

    .day {
      margin-bottom: 32px;
    }

    .day_image {
      width: 100%;
      margin-bottom: 24px;
      border-radius: 6px;
      overflow: hidden;
    }

    .day_image  img {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      display: block;
    }

    .day-header {
      display: grid;
      gap: 12px;
      margin-bottom: 8px;
    }

    .day-header h3 {
      font-size: 13pt;
      font-weight: 600;
    }

    .icon_wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      color: inherit;
    }

    .icons {
      width: 1rem;
      height: 1rem;
    }

    /* Matches your h4 accent tag style */
    .location-tag {
      display: inline-flex;
      max-width: max-content;
      background: #c8a96e;
      color: #fff;
      border-radius: 50px;
      font-size: 9pt;
      font-weight: 300;
      padding: 2px 12px;
      white-space: nowrap;
    }

    .preview-day p {
      margin-bottom: 6px;
    }

    /* Matches your .accommodation accent colour */
    .accommodation {
      font-size: 10pt;
      color: #c8a96e;
    }

    /* ---- SECTIONS ---- */
    .section {
      margin-bottom: 36px;
      page-break-inside: avoid;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #ddd;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      margin-bottom: 6px;
      margin-top: 12px;
    }

    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }

    p { margin-bottom: 8px; }

    /* ---- VESSELS --- */
    .vessel_section {
      margin-bottom: 36px;
      page-break-inside: avoid;
    }

    .vessel_card {
      display: flex;
      gap: 18px;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 14px;
    }

    .vessel_card img {
      width: 140px;
      height: 100px;
      object-fit: cover;
      border-radius: 6px;
    }

    .vessel_type {
      color: #c8a96e;
      font-weight: 600;
    }


    /* ---- NOTES ---- */
    .note-section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .note_image {
      width: 100%;
      margin-bottom: 16px;
      border-radius: 6px;
      overflow: hidden;
    }

    .note_image img {
      width: 100%;
      max-height: 250px;
      object-fit: cover;
      display: block;
    }

  </style>
</head>
  <body>

    ${trip.heroImage ? `
      <div class="hero_container">
        <img class="bg-full" src="${trip.heroImage}" />
        <div class="hero_overview">
          <div class="hero_logo">
            <img src="https://res.cloudinary.com/awsnf/image/upload/v1781161096/awsnf_logo_white.png" />
          </div>
          <h1>${trip.title || 'Trip Notes'}</h1>  
          <div style="margin-block: 15px;">
            <div class="hero_icon">
              <span>${ICON_ITINERARY} ${trip.durationDays} days / ${trip.durationNights} nights</span>
            </div>
            <div class="hero_icon">
              <span>${ICON_CALENDAR} Departs ${departureDisplay}</span>
            </div>
          </div>
        </div>
      </div>` : ''}

 <div class="page_content">     
    <div class="trip_overview">
      <h2>${trip.title || 'Trip Notes'}</h2>
      ${trip.overview ? `<p>${trip.overview}</p>` : ''}
    </div>

    ${days ? `<div class="trip_days">${days}</div>` : ''}

    ${inclusions ? `
      <div class="section">
        <h2>Inclusions</h2>
        <ul>${inclusions}</ul>
      </div>` : ''}

    ${exclusions ? `
      <div class="section">
        <h2>Exclusions</h2>
        <ul>${exclusions}</ul>
      </div>` : ''}

    ${trip.vessel ? `
      <div class="vessel_section">
        <div class="vessel_card">
          <img src="${trip.vessel.image}" />
          <div>
            <h3>${trip.vessel.name}</h3>
            <p class="vessel_type">${trip.vessel.type}</p>
            ${trip.vessel.description ? `<p>${trip.vessel.description}</p>` : ''}
          </div>
        </div>
      </div>` : ''}

    ${notes ? `
      <div class="section">
        <h2>Additional Notes</h2>
        ${notes}
    </div>` : ''}
</div>

  </body>
</html>`;
}

router.post('/', async (req, res) => {
  const trip = req.body;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    });

    const page = await browser.newPage();

    await page.setContent(buildTripHtml(trip), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '20mm', left: '20mm', right: '20mm' },
      timeout: 60000,
    });
    
    const pdfBuffer = Buffer.from(pdf);
    const safeName = (trip.title || 'Trip Notes').replace(/[^\w\-]+/g, '_');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}.pdf"`
    );
    res.setHeader('Content-Length', String(pdfBuffer.length));

    return res.end(pdfBuffer)
  } catch (err) {
    console.error('PDF generation failed:', err);
    return res.status(500).json({ message: 'PDF generation failed', error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

export default router;