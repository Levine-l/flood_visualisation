const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'flood-records', label: 'Flood Records' },
  { id: 'Time-patterns', label: 'Time Patterns' },
  { id: 'housing-exposure', label: 'Housing Exposure' },
  { id: 'market-context', label: 'Market Context', target: 'outer-trend-card' },
  { id: 'insights', label: 'Insights' },
  { id: 'team', label: 'Team' },
];

document.body.classList.add('experience-ready');

function createOpeningSplash() {
  const splash = document.createElement('div');
  splash.className = 'opening-splash';
  splash.setAttribute('aria-hidden', 'true');
  splash.innerHTML = `
    <div class="opening-splash-water"></div>
    <div class="opening-splash-spray" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
    <div class="opening-splash-crest" aria-hidden="true">
      <span></span>
      <span></span>
    </div>
    <div class="opening-splash-waves">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="opening-splash-content">
      <span class="opening-splash-kicker">Flood Risk Visualisation</span>
      <strong>UK Flood Explorer</strong>
      <em>Flood outlines · Urban exposure · Housing market signals</em>
      <div class="opening-splash-meter"><span></span></div>
    </div>
  `;

  document.documentElement.classList.add('splash-active');
  document.body.prepend(splash);

  const dismiss = () => {
    if (splash.classList.contains('is-leaving')) return;
    splash.classList.add('is-leaving');
    document.documentElement.classList.remove('splash-active');
    window.setTimeout(() => splash.remove(), prefersReducedMotion ? 80 : 780);
  };

  splash.addEventListener('click', dismiss, { once: true });
  window.setTimeout(dismiss, prefersReducedMotion ? 360 : 2400);
}

function createProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.innerHTML = '<span></span>';
  document.body.prepend(bar);

  const fill = bar.firstElementChild;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function createStoryRail() {
  const rail = document.createElement('nav');
  rail.className = 'story-rail';
  rail.setAttribute('aria-label', 'Story sections');

  rail.innerHTML = sections
    .map(({ id, label, target = id }) => {
      const exists = document.getElementById(target);
      if (!exists) return '';
      return `<a href="#${target}" data-rail-link="${id}" aria-label="${label}"><span>${label}</span></a>`;
    })
    .join('');

  if (!rail.innerHTML.trim()) return;
  document.body.append(rail);

  rail.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => link.classList.add('is-click-muted'));
    link.addEventListener('pointerleave', () => link.classList.remove('is-click-muted'));
    link.addEventListener('blur', () => link.classList.remove('is-click-muted'));
  });
}

function enhanceAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target || prefersReducedMotion) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    });
  });
}

function revealOnScroll() {
  const revealTargets = [
    '.section-header',
    '.cover-text',
    '.cover-visual',
    '.cover-feature',
    '.fr-panel',
    '.map-card',
    '.legend-bar',
    '.city-stack',
    '.chart-grid',
    '.mc-transition-text',
    '.outer-trend-card',
    '.mc-city-card',
    '.conclusion-copy p',
    '.author-card',
    '.site-footer-inner',
  ];

  const elements = document.querySelectorAll(revealTargets.join(','));
  elements.forEach((el, index) => {
    el.classList.add('fx-reveal');
    el.style.setProperty('--fx-delay', `${Math.min(index % 6, 5) * 55}ms`);
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.16 });

  elements.forEach((el) => observer.observe(el));
}

function syncStoryRail() {
  const links = document.querySelectorAll('[data-rail-link]');
  const observed = sections
    .map(({ id, target = id }) => {
      const element = document.getElementById(target);
      if (element) element.dataset.railSection = id;
      return element;
    })
    .filter(Boolean);

  if (!links.length || !observed.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.railLink === id));
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActive(visible[0].target.dataset.railSection || visible[0].target.id);
  }, { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.25, 0.5, 0.75] });

  observed.forEach((section) => observer.observe(section));
  setActive('overview');
}

function addCardTilt() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.cover-feature, .mc-city-card, .author-card, .outer-trend-card').forEach((card) => {
    card.classList.add('fx-tilt');
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.setProperty('--tilt-x', `${(-y * 2.2).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 2.2).toFixed(2)}deg`);
      card.style.setProperty('--glow-x', `${((x + 1) / 2 * 100).toFixed(1)}%`);
      card.style.setProperty('--glow-y', `${((y + 1) / 2 * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
}

function markTextEffects() {
  document.querySelectorAll('.cover-title, .section-title, .main-title, .mc-text-heading').forEach((el) => {
    el.classList.add('fx-title');
  });
  document.querySelectorAll('.mc-transition-question, .conclusion-copy p:last-child').forEach((el) => {
    el.classList.add('fx-question');
  });
}

createOpeningSplash();
createProgress();
createStoryRail();
markTextEffects();
enhanceAnchors();
revealOnScroll();
syncStoryRail();
addCardTilt();


(() => {
  const d3 = window.d3;
  const CSV_PATH = "data/four_city_events.csv";

  const CITY_ORDER = ["Hull", "York", "GreatYarmouth", "London"];
  const CITY_DISPLAY = {
    Hull: "Hull",
    York: "York",
    GreatYarmouth: "Great Yarmouth",
    London: "Greater London",
  };

  const SEASON_COLOUR = {
    Spring: "#97d8c4",
    Summer: "#f4b942",
    Autumn: "#F2BEFC",
    Winter: "#4059ad",
    Unknown: "#999999",
  };
  const SEASON_ORDER = ["Spring", "Summer", "Autumn", "Winter", "Unknown"];
  const SOURCE_COLOUR = [
    "#2563eb",
    "#38bdf8",
    "#0f766e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#64748b",
  ];

  const MAP_GEOJSON = "data/uk_flood_frequency_simplified.geojson";
  const MAP_NAME_FIELD = "LAD25NM";
  const MAP_COUNT_FIELD = "polygon_count";

  const tooltip = document.getElementById("tooltip");
  const errorBanner = document.getElementById("error-banner");

  // Kick off the choropleth map (independent of the temporal charts).
  initHeroMap();

  // Section 03 — city tab interactions (placeholder for now).
  initHousingCityTabs();

  d3.csv(CSV_PATH, rowParser)
    .then((rows) => {
      const cleaned = rows.filter((d) => d && Number.isFinite(d.fxg_year));
      const grouped = buildCityYearData(cleaned);
      renderLegends(cleaned);
      renderAllPanels(grouped);
      window.addEventListener("resize", debounce(() => renderAllPanels(grouped), 120));
    })
    .catch((err) => {
      console.error("Failed to load flood dataset:", err);
      errorBanner.hidden = false;
    });

  function rowParser(row) {
    const year = +row.fxg_year;
    const month = +row.fxg_month;
    if (!Number.isFinite(year) || year <= 0) return null;

    const rawSeason = (row.fxg_season || "").trim();
    const season = SEASON_ORDER.includes(rawSeason) ? rawSeason : "Unknown";

    return {
      rec_grp_id: row.rec_grp_id,
      city: row.city,
      fxg_year: year,
      fxg_month: Number.isFinite(month) ? month : null,
      fxg_season: season,
      fxg_name: row.fxg_name || "",
      fxg_start_date: row.fxg_start_date || "",
      fxg_end_date: row.fxg_end_date || "",
      fxg_flood_src: (row.fxg_flood_src || "").trim() || "Unknown",
      fxg_flood_caus: (row.fxg_flood_caus || "").trim() || "Unknown",
    };
  }

  function buildCityYearData(rows) {
    const out = {};
    for (const city of CITY_ORDER) out[city] = [];

    const byCity = d3.group(rows, (d) => d.city);

    for (const city of CITY_ORDER) {
      const cityRows = byCity.get(city) || [];

      const uniqueById = Array.from(
        d3.group(cityRows, (d) => d.rec_grp_id),
        ([id, items]) => items[0]
      );

      const byYear = d3.group(uniqueById, (d) => d.fxg_year);

      const yearEntries = Array.from(byYear, ([year, events]) => {
        const seasonCounts = {};
        for (const s of SEASON_ORDER) seasonCounts[s] = 0;
        for (const e of events) seasonCounts[e.fxg_season] += 1;

        const dominantSeason = Object.entries(seasonCounts).sort(
          (a, b) => b[1] - a[1] || SEASON_ORDER.indexOf(a[0]) - SEASON_ORDER.indexOf(b[0])
        )[0][0];

        return {
          city,
          year,
          event_count: events.length,
          dominant_season: dominantSeason,
          seasonCounts,
          events,
        };
      }).sort((a, b) => a.year - b.year);

      out[city] = yearEntries;
    }

    return out;
  }

  function renderLegends(allRows) {
    const seasonLegend = document.getElementById("season-legend");
    seasonLegend.innerHTML = "";
    for (const season of SEASON_ORDER) {
      const chip = document.createElement("span");
      chip.className = "legend-chip";
      chip.innerHTML = `<span class="legend-swatch" style="background:${SEASON_COLOUR[season]}"></span>${season}`;
      seasonLegend.appendChild(chip);
    }

    const totals = document.getElementById("totals-legend");
    totals.innerHTML = "";
    for (const city of CITY_ORDER) {
      const cityRows = allRows.filter((d) => d.city === city);
      const uniqueCount = new Set(cityRows.map((d) => d.rec_grp_id)).size;
      const chip = document.createElement("span");
      chip.className = "legend-chip";
      chip.innerHTML = `<strong>${CITY_DISPLAY[city]}</strong><span class="count">${uniqueCount}</span>`;
      totals.appendChild(chip);
    }
  }

  function renderAllPanels(grouped) {
    const grid = d3.select("#chart-grid");
    grid.selectAll(".panel").remove();

    const maxCount = d3.max(Object.values(grouped).flat(), (d) => d.event_count) || 1;

    for (const city of CITY_ORDER) {
      const panel = grid
        .append("div")
        .attr("class", "panel flip-panel")
        .attr("data-city", city);
      const inner = panel.append("div").attr("class", "flip-panel-inner");
      const front = inner.append("div").attr("class", "flip-face flip-face-front");
      const back = inner.append("div").attr("class", "flip-face flip-face-back");
      const cityData = grouped[city];
      const total = d3.sum(cityData, (d) => d.event_count);
      const summary = summariseCityBreakdowns(cityData);

      const years = cityData.map((d) => d.year);
      const xDomain = years.length ? [d3.min(years) - 1, d3.max(years) + 1] : [2000, 2020];

      front.append("div").attr("class", "panel-header").html(`
        <h2 class="panel-title">${CITY_DISPLAY[city]}</h2>
        <div class="panel-header-actions">
          <span class="panel-meta"><span class="meta-value">${total}</span> events</span>
          <button class="panel-flip-btn" type="button" aria-label="Show ${CITY_DISPLAY[city]} pie charts">Flip</button>
        </div>
      `);

      const seasonsPresent = SEASON_ORDER.filter((s) =>
        cityData.some((d) => d.dominant_season === s)
      );
      const legendRow = front
        .append("div")
        .attr("class", "panel-legend")
        .attr("aria-label", "Seasons shown in this chart");
      for (const season of seasonsPresent) {
        const chip = legendRow.append("span").attr("class", "panel-legend-chip");
        chip
          .append("span")
          .attr("class", "panel-legend-swatch")
          .style("background", SEASON_COLOUR[season]);
        chip.append("span").text(season);
      }

      drawPanelChart(front.node(), cityData, { xDomain, maxCount });
      renderPanelBack(back, city, total, summary);
    }

    grid.selectAll(".panel-flip-btn").on("click", function () {
      const card = this.closest(".flip-panel");
      if (!card) return;
      card.classList.toggle("is-flipped");
    });
  }

  function summariseCityBreakdowns(cityData) {
    const uniqueEvents = Array.from(
      d3.group(cityData.flatMap((d) => d.events), (d) => d.rec_grp_id),
      ([, items]) => items[0]
    );

    const bySeason = SEASON_ORDER.map((season) => ({
      label: season,
      value: uniqueEvents.filter((event) => event.fxg_season === season).length,
      color: SEASON_COLOUR[season],
    })).filter((d) => d.value > 0);

    const sourceEntries = Array.from(
      d3.rollup(
        uniqueEvents,
        (items) => items.length,
        (event) => cleanSourceLabel(event.fxg_flood_src)
      ),
      ([label, value], index) => ({
        label,
        value,
        color: SOURCE_COLOUR[index % SOURCE_COLOUR.length],
      })
    ).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

    return { bySeason, bySource: sourceEntries };
  }

  function cleanSourceLabel(value) {
    const label = (value || "").trim();
    if (!label) return "Unknown";
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function renderPanelBack(back, city, total, summary) {
    back.html(`
      <div class="panel-back-header">
        <div>
          <h2 class="panel-title">${CITY_DISPLAY[city]}</h2>
          <p class="panel-back-subtitle">${total} recorded events · grouped by season and source</p>
        </div>
        <button class="panel-flip-btn" type="button" aria-label="Return to ${CITY_DISPLAY[city]} annual chart">Back</button>
      </div>
      <div class="panel-pies">
        <article class="pie-card">
          <h3>By season</h3>
          <div class="pie-chart" data-pie="season"></div>
        </article>
        <article class="pie-card">
          <h3>By source</h3>
          <div class="pie-chart" data-pie="source"></div>
        </article>
      </div>
    `);

    drawPieChart(back.select('[data-pie="season"]').node(), summary.bySeason);
    drawPieChart(back.select('[data-pie="source"]').node(), summary.bySource);
  }

  function drawPieChart(container, data) {
    const width = 230;
    const height = 196;
    const radius = 58;
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    if (!data.length) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "pie-empty")
        .text("No data");
      return;
    }

    const total = d3.sum(data, (d) => d.value);
    const pie = d3.pie().value((d) => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.52).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.52).outerRadius(radius + 4);
    const g = svg.append("g").attr("transform", `translate(${72},${height / 2 - 4})`);

    g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("class", "pie-slice")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .on("mouseenter", function () {
        d3.select(this).transition().duration(130).attr("d", arcHover);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(130).attr("d", arc);
      });

    g.append("text")
      .attr("class", "pie-total")
      .attr("text-anchor", "middle")
      .attr("y", -2)
      .text(total);
    g.append("text")
      .attr("class", "pie-total-label")
      .attr("text-anchor", "middle")
      .attr("y", 14)
      .text("events");

    const legend = svg.append("g").attr("class", "pie-legend").attr("transform", "translate(142,38)");
    const maxLegend = 5;
    const visible = data.slice(0, maxLegend);
    visible.forEach((item, index) => {
      const row = legend.append("g").attr("transform", `translate(0,${index * 24})`);
      row.append("circle").attr("r", 4.5).attr("fill", item.color).attr("cx", 0).attr("cy", 0);
      row.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .text(`${item.label} (${item.value})`);
    });
    if (data.length > maxLegend) {
      legend.append("text")
        .attr("x", 10)
        .attr("y", maxLegend * 24 + 4)
        .attr("class", "pie-more")
        .text(`+${data.length - maxLegend} more`);
    }
  }

  function drawPanelChart(container, data, { xDomain, maxCount }) {
    const width = container.clientWidth || 520;
    const height = Math.max(240, Math.min(320, Math.round(width * 0.58)));
    const margin = { top: 16, right: 20, bottom: 42, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerW]);
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(1, maxCount)])
      .nice()
      .range([innerH, 0]);

    g.append("g")
      .attr("class", "gridline")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerW)
          .tickFormat("")
          .ticks(Math.min(6, y.domain()[1]))
      );

    const xAxis = d3
      .axisBottom(x)
      .ticks(Math.min(8, Math.floor(innerW / 70)))
      .tickFormat(d3.format("d"));
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis);

    const yAxis = d3
      .axisLeft(y)
      .ticks(Math.min(6, y.domain()[1]))
      .tickFormat(d3.format("d"));
    g.append("g").attr("class", "axis").call(yAxis);

    g.append("text")
      .attr("class", "axis-title")
      .attr("x", innerW / 2)
      .attr("y", innerH + 34)
      .attr("text-anchor", "middle")
      .text("Year");

    g.append("text")
      .attr("class", "axis-title")
      .attr("transform", `rotate(-90)`)
      .attr("x", -innerH / 2)
      .attr("y", -34)
      .attr("text-anchor", "middle")
      .text("Annual Event Count");

    if (!data.length) {
      g.append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-muted)")
        .attr("font-size", 13)
        .text("No recorded events");
      return;
    }

    const yearSpan = Math.max(1, xDomain[1] - xDomain[0]);
    const barWidth = Math.max(2, Math.min(14, (innerW / yearSpan) * 0.82));
    const hoverWidth = Math.max(barWidth, 14);

    const segments = [];
    for (const yearData of data) {
      let y0 = 0;
      for (const season of SEASON_ORDER) {
        const count = yearData.seasonCounts[season] || 0;
        if (count > 0) {
          segments.push({ yearData, season, y0, y1: y0 + count });
          y0 += count;
        }
      }
    }

    const segmentSel = g
      .selectAll("rect.segment")
      .data(segments)
      .enter()
      .append("rect")
      .attr("class", "segment")
      .attr("x", (d) => x(d.yearData.year) - barWidth / 2)
      .attr("width", barWidth)
      .attr("y", innerH)
      .attr("height", 0)
      .attr("fill", (d) => SEASON_COLOUR[d.season])
      .attr("rx", 1.5);

    segmentSel
      .transition()
      .delay((_, i) => 80 + i * 10)
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.y1))
      .attr("height", (d) => Math.max(1, y(d.y0) - y(d.y1)));

    const activate = (yearData) =>
      g
        .selectAll("rect.segment")
        .classed("is-active", (s) => s.yearData === yearData);
    const deactivate = () => g.selectAll("rect.segment").classed("is-active", false);

    g.selectAll("rect.year-hit")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "year-hit")
      .attr("x", (d) => x(d.year) - hoverWidth / 2)
      .attr("y", 0)
      .attr("width", hoverWidth)
      .attr("height", innerH)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mouseenter", function (event, d) {
        activate(d);
        showTooltip(event, d);
      })
      .on("mousemove", (event) => positionTooltip(event))
      .on("mouseleave", function () {
        deactivate();
        hideTooltip();
      });
  }

  function showTooltip(event, d) {
    const srcs = uniqueList(d.events.map((e) => e.fxg_flood_src));
    const causes = uniqueList(d.events.map((e) => e.fxg_flood_caus));
    const dateRange = summariseDates(d.events);

    const breakdown = SEASON_ORDER
      .filter((s) => (d.seasonCounts[s] || 0) > 0)
      .map(
        (s) =>
          `<span class="tt-chip"><span class="tt-chip-dot" style="background:${SEASON_COLOUR[s]}"></span>${s} · ${d.seasonCounts[s]}</span>`
      )
      .join(" ");

    tooltip.innerHTML = `
      <div class="tt-header">
        <span class="tt-swatch" style="background:${SEASON_COLOUR[d.dominant_season]}"></span>
        ${CITY_DISPLAY[d.city]} · ${d.year}
      </div>
      <div class="tt-row"><span class="tt-label">Events</span><span class="tt-value accent">${d.event_count}</span></div>
      <div class="tt-row"><span class="tt-label">By season</span><span class="tt-value">${breakdown}</span></div>
      <div class="tt-row"><span class="tt-label">Source(s)</span><span class="tt-value">${srcs}</span></div>
      <div class="tt-row"><span class="tt-label">Cause(s)</span><span class="tt-value">${causes}</span></div>
      ${dateRange ? `<div class="tt-row"><span class="tt-label">Dates</span><span class="tt-value"><span class="nowrap">${dateRange}</span></span></div>` : ""}
    `;
    tooltip.classList.add("visible");
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(event);
  }

  function positionTooltip(event) {
    const pad = 14;
    const rect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = event.clientX + pad;
    let top = event.clientY + pad;
    if (left + rect.width + pad > vw) left = event.clientX - rect.width - pad;
    if (top + rect.height + pad > vh) top = event.clientY - rect.height - pad;
    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("visible", "is-map");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function uniqueList(arr) {
    const clean = arr
      .map((s) => (s || "").trim())
      .filter((s) => s && s.toLowerCase() !== "unknown");
    if (!clean.length) return "Unknown";
    return Array.from(new Set(clean)).join(", ");
  }

  function summariseDates(events) {
    const starts = events.map((e) => e.fxg_start_date).filter(Boolean).sort();
    const ends = events.map((e) => e.fxg_end_date).filter(Boolean).sort();
    if (!starts.length && !ends.length) return "";
    const first = starts[0] ? starts[0].slice(0, 10) : "—";
    const last = ends.length ? ends[ends.length - 1].slice(0, 10) : "—";
    return `${first} → ${last}`;
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  /* ----------------------------------------------------
     HERO CHOROPLETH MAP
     ---------------------------------------------------- */

  async function initHeroMap() {
    const container = document.getElementById("map-container");
    const loading = document.getElementById("map-loading");
    if (!container) return;

    let geo;
    try {
      geo = await d3.json(MAP_GEOJSON);
    } catch (err) {
      console.error("Failed to load UK flood frequency map:", err);
      if (loading) loading.textContent = "Map data unavailable";
      return;
    }

    // Pre-correct longitudes by cos(central UK latitude) so the flat
    // identity projection renders the UK with realistic proportions
    // (counters lon-degree distortion at ~55°N).
    geo = adjustForUKAspect(geo, 54.5);

    const counts = geo.features.map(
      (f) => +f.properties[MAP_COUNT_FIELD] || 0
    );
    const nonZero = counts.filter((c) => c > 0).sort(d3.ascending);
    const maxCount = d3.max(counts) || 1;

    // 7-class quantile scale on non-zero values → highlights the skew.
    const palette = d3.schemeBlues[7];
    const quantiles = [];
    for (let i = 1; i < 7; i++) {
      quantiles.push(d3.quantileSorted(nonZero, i / 7));
    }
    const classify = (value) => {
      if (!value || value <= 0) return 0;
      for (let i = 0; i < quantiles.length; i++) {
        if (value <= quantiles[i]) return i + 1;
      }
      return 6;
    };
    const fillFor = (value) =>
      value == null || value <= 0 ? "#e6ecef" : palette[classify(value)];

    const svg = d3
      .select(container)
      .append("svg")
      .attr("role", "img")
      .attr("aria-label", "UK choropleth of recorded flood outlines by local authority");

    const viewGroup = svg.append("g").attr("class", "map-view");
    const pathsGroup = viewGroup.append("g").attr("class", "map-paths");

    const pathGen = d3.geoPath();
    let projection;
    let currentDims = { width: 0, height: 0 };

    // Lat ceiling for "England-focused" framing — excludes Scottish highlands
    // / Northern Isles from the fit bounds so the initial view centres on
    // England + Wales + the immediate Scottish border. Features above this
    // are still drawn (they just fall outside the viewport and are clipped).
    const FIT_LAT_MAX = 55.9;
    function featureLatBBox(f) {
      let yMin = Infinity, yMax = -Infinity;
      (function walk(coords) {
        if (typeof coords[0] === "number") {
          if (coords[1] < yMin) yMin = coords[1];
          if (coords[1] > yMax) yMax = coords[1];
        } else coords.forEach(walk);
      })(f.geometry.coordinates);
      return { yMin, yMax };
    }
    const fitFeatures = geo.features.filter((f) => {
      const { yMin, yMax } = featureLatBBox(f);
      // Centroid latitude below the ceiling — keeps England + Wales + a
      // touch of southern Scotland.
      return (yMin + yMax) / 2 <= FIT_LAT_MAX;
    });
    const fitTarget = fitFeatures.length
      ? { type: "FeatureCollection", features: fitFeatures }
      : geo;

    // ---- Centring knobs ----
    // PAD_*: padding inside the container on each edge (px).
    //   Increase one side to push the map AWAY from that edge.
    // OFFSET_X / OFFSET_Y: extra translation applied AFTER fitExtent (px).
    //   Positive X moves the map right; positive Y moves it down.
    const PAD_TOP = 200;
    const PAD_RIGHT = 60;
    const PAD_BOTTOM = 1;
    const PAD_LEFT = 1;
    const OFFSET_X = -20;
    const OFFSET_Y = 20;

    function sizeAndProject() {
      const rect = container.getBoundingClientRect();
      const width = Math.max(200, rect.width);
      const height = Math.max(200, rect.height);
      currentDims = { width, height };

      svg.attr("viewBox", `0 0 ${width} ${height}`);

      // Use geoIdentity for UK-scale data — avoids the spherical-clip
      // artifacts that geoMercator adds around each feature. Fit to the
      // England-focused subset, then nudge with OFFSET_X/Y so the visible
      // map (England + Wales) sits dead-centre in the frame.
      projection = d3.geoIdentity().reflectY(true)
        .fitExtent(
          [[PAD_LEFT, PAD_TOP], [width - PAD_RIGHT, height - PAD_BOTTOM]],
          fitTarget
        );
      const [tx, ty] = projection.translate();
      projection.translate([tx + OFFSET_X, ty + OFFSET_Y]);
      pathGen.projection(projection);

      pathsGroup.selectAll("path.la-path").attr("d", pathGen);
    }

    // Initial paths
    pathsGroup
      .selectAll("path.la-path")
      .data(geo.features, (d) => d.properties[MAP_NAME_FIELD])
      .enter()
      .append("path")
      .attr("class", "la-path")
      .attr("fill", (d) => fillFor(+d.properties[MAP_COUNT_FIELD]))
      .on("mouseenter", function (event, d) {
        d3.select(this).raise().classed("is-active", true);
        showMapTooltip(event, d);
      })
      .on("mousemove", (event) => positionTooltip(event))
      .on("mouseleave", function () {
        d3.select(this).classed("is-active", false);
        hideTooltip();
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        zoomToFeature(d);
      });

    sizeAndProject();

    // Zoom behaviour
    const zoom = d3
      .zoom()
      .scaleExtent([1, 15])
      .on("zoom", (event) => {
        viewGroup.attr("transform", event.transform);
        pathsGroup.selectAll("path.la-path").attr("stroke-width", 0.35 / event.transform.k);
      });

    svg.call(zoom);
    svg.on("dblclick.zoom", null); // disable d3-zoom's default dblclick-zoom

    function zoomToFeature(feature) {
      const [[x0, y0], [x1, y1]] = pathGen.bounds(feature);
      const dx = x1 - x0;
      const dy = y1 - y0;
      const { width, height } = currentDims;
      const scale = Math.min(
        12,
        5 / Math.max(dx / width, dy / height)
      );
      const tx = (width - scale * (x0 + x1)) / 2;
      const ty = (height - scale * (y0 + y1)) / 2;
      svg
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
    }

    svg.on("dblclick", (event) => {
      // Only reset when double-click lands on empty background (no LA path).
      if (event.target && event.target.classList.contains("la-path")) return;
      svg
        .transition()
        .duration(600)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Legend
    renderMapLegend(quantiles, palette, maxCount);

    // Responsive re-projection
    const onResize = debounce(() => {
  const d3 = window.d3;
      sizeAndProject();
      svg.call(zoom.transform, d3.zoomIdentity);
    }, 150);
    window.addEventListener("resize", onResize);

    // Hide loading overlay
    if (loading) {
      requestAnimationFrame(() => loading.classList.add("is-hidden"));
      setTimeout(() => loading.remove(), 700);
    }
  }

  function renderMapLegend(quantiles, palette, maxCount) {
    const legend = d3.select("#map-legend");
    if (legend.empty()) return;
    legend.selectAll("*").remove();

    legend
      .append("span")
      .attr("class", "legend-title")
      .text("Number of Recorded Flood Outlines");

    // "No record" swatch
    const zeroItem = legend.append("span").attr("class", "legend-bucket");
    zeroItem
      .append("span")
      .attr("class", "legend-bucket-swatch")
      .style("background", "#e6ecef");
    zeroItem.append("span").text("0");

    const edges = [0, ...quantiles.map((q) => Math.round(q)), Math.round(maxCount)];
    for (let i = 1; i < edges.length; i++) {
      const lo = edges[i - 1] + (i === 1 ? 1 : 1);
      const hi = edges[i];
      const label = lo >= hi ? `${hi}` : `${lo}–${hi}`;
      const item = legend.append("span").attr("class", "legend-bucket");
      item
        .append("span")
        .attr("class", "legend-bucket-swatch")
        .style("background", palette[i - 1]);
      item.append("span").text(label);
    }
  }

  function showMapTooltip(event, feature) {
    const name = feature.properties[MAP_NAME_FIELD] || "Unknown";
    const count = +feature.properties[MAP_COUNT_FIELD] || 0;
    tooltip.innerHTML = `
      <div class="tt-header">${name}</div>
      <div class="tt-map-stat">
        <span class="tt-map-label">Recorded flood outlines</span>
        <span class="tt-map-value">${count.toLocaleString()}</span>
      </div>
    `;
    tooltip.classList.add("visible", "is-map");
    tooltip.setAttribute("aria-hidden", "false");
    positionTooltip(event);
  }

  /* ----------------------------------------------------
     SECTION 03 — CITY TABS
     ---------------------------------------------------- */

  function initHousingCityTabs() {
    const tabs = document.querySelectorAll(".city-tab");
    if (!tabs.length) return;
    const selectedLabel = document.getElementById("housing-selected-city");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        if (selectedLabel) {
          selectedLabel.textContent = tab.dataset.city || "";
        }
      });
    });
  }

  /* ----------------------------------------------------
     HERO LEFT — EVENT HISTORY BROWSER
     ---------------------------------------------------- */

  function renderEventHistory(rows) {
    const list = document.getElementById("event-history-list");
    if (!list) return;

    // De-duplicate by rec_grp_id and sort most-recent-first.
    const seen = new Set();
    const sorted = rows
      .slice()
      .sort((a, b) => {
        const da = a.fxg_start_date || "";
        const db = b.fxg_start_date || "";
        if (db !== da) return db.localeCompare(da);
        return (b.fxg_year || 0) - (a.fxg_year || 0);
      });

    const unique = [];
    for (const r of sorted) {
      if (!r.rec_grp_id || seen.has(r.rec_grp_id)) continue;
      seen.add(r.rec_grp_id);
      unique.push(r);
    }

    if (!unique.length) {
      list.innerHTML = `<li class="history-item history-item-empty">No events to display.</li>`;
      return;
    }

    list.innerHTML = unique
      .map((r) => {
        const cityName = CITY_DISPLAY[r.city] || r.city || "";
        const season = r.fxg_season || "Unknown";
        const seasonColor = SEASON_COLOUR[season] || SEASON_COLOUR.Unknown;
        const src =
          r.fxg_flood_src && r.fxg_flood_src.toLowerCase() !== "unknown"
            ? r.fxg_flood_src
            : "";
        const meta = [cityName, season, src].filter(Boolean).join(" · ");
        const name = r.fxg_name && r.fxg_name.trim()
          ? r.fxg_name
          : `${cityName} flood event`;
        return `
          <li class="history-item" data-year="${r.fxg_year}">
            <span class="history-marker" style="background:${seasonColor}" aria-hidden="true"></span>
            <span class="history-year">${r.fxg_year}</span>
            <div class="history-body">
              <p class="history-text">${escapeHtml(name)}</p>
              <p class="history-meta">${escapeHtml(meta)}</p>
            </div>
          </li>
        `;
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  function adjustForUKAspect(geojson, centralLat) {
    const k = Math.cos((centralLat * Math.PI) / 180);
    function transformCoords(coords) {
      if (typeof coords[0] === "number") {
        return [coords[0] * k, coords[1]];
      }
      return coords.map(transformCoords);
    }
    return {
      type: "FeatureCollection",
      features: geojson.features.map((f) => ({
        type: "Feature",
        properties: f.properties,
        geometry: {
          type: f.geometry.type,
          coordinates: transformCoords(f.geometry.coordinates),
        },
      })),
    };
  }
})();


/* ============================================================
     COVER (DARK) — sticky-nav state, active section tracking,
     dark hero-map render, and feature-card motif generators.
     ============================================================ */
  (function () {
    /* ---- 1. Sticky nav: shadow / opacity on scroll ---- */
    const nav = document.getElementById('site-nav');
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- 2. Active nav link via IntersectionObserver ---- */
    const navLinks = document.querySelectorAll('.site-nav-links a[data-nav-link]');
    const sectionIds = ['overview','flood-records','Time-patterns','market-context','housing-exposure','insights','team'];
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const setActive = (id) => {
        navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.navLink === id));
      };
      const io = new IntersectionObserver((entries) => {
        // Pick the entry whose ratio is highest among intersecting entries.
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
      sections.forEach(s => io.observe(s));
      setActive('overview');
    }

    /* ---- 3. Feature-card motifs (bars + pixel grid) ---- */
    function drawBarsMotif() {
      const g = document.querySelector('.cover-feature--teal .cover-motif-bars');
      if (!g) return;
      const W = 200, BAR_W = 4, GAP = 2, BASE = 36;
      const N = Math.floor(W / (BAR_W + GAP));
      // Pseudo-random heights with a gentle wave so it reads as seasonal data.
      let svgInner = '';
      for (let i = 0; i < N; i++) {
        const wave = Math.sin(i / 3.2) * 0.35 + Math.sin(i / 1.4) * 0.15 + 0.55;
        const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const h = Math.max(3, Math.min(34, wave * 26 + Math.abs(noise) * 6));
        const x = i * (BAR_W + GAP);
        const y = BASE - h;
        const op = 0.55 + (h / 34) * 0.4;
        svgInner += `<rect x="${x}" y="${y.toFixed(1)}" width="${BAR_W}" height="${h.toFixed(1)}" rx="0.6" opacity="${op.toFixed(2)}"/>`;
      }
      // overlay a thin trend dotted line on top of bars
      let dots = '';
      for (let i = 0; i < N; i += 2) {
        const wave = Math.sin(i / 3.2) * 0.35 + Math.sin(i / 1.4) * 0.15 + 0.55;
        const h = wave * 26 + 4;
        const cx = i * (BAR_W + GAP) + BAR_W / 2;
        const cy = BASE - h - 2;
        dots += `<circle cx="${cx}" cy="${cy.toFixed(1)}" r="1" opacity="0.85"/>`;
      }
      g.innerHTML = svgInner + dots;
    }

    function drawPixelMotif() {
      const g = document.querySelector('.cover-motif-pixels');
      if (!g) return;
      const COLS = 40, ROWS = 5, CELL = 4, GAP = 1;
      const xOff = 200 - (COLS * (CELL + GAP) - GAP);
      let inner = '';
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          // Diagonal density gradient + noise
          const t = (c / COLS) * 0.7 + (r / ROWS) * 0.3;
          const noise = ((Math.sin((c + 1) * 91 + r * 7) * 43758.5453) % 1 + 1) % 1;
          if (noise > 1 - t * 0.95) continue;
          const op = 0.25 + t * 0.65;
          const x = xOff + c * (CELL + GAP);
          const y = 8 + r * (CELL + GAP);
          inner += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="0.6" opacity="${op.toFixed(2)}"/>`;
        }
      }
      g.innerHTML = inner;
    }

    drawBarsMotif();
    drawPixelMotif();

    /* ---- 4. Dark hero map render ---- */
    const MAP_URL = 'data/uk_flood_frequency_simplified.geojson';
    const NAME_FIELD = 'LAD25NM';
    const COUNT_FIELD = 'polygon_count';

    // Cities to highlight — actual study cities + visual placement helpers.
    // [name, lon, lat, label-anchor "left"|"right", optional pixel-offset (in svg viewBox units)]
    const CITIES = [
      { name: 'Hull',           lon: -0.336, lat: 53.745, side: 'right', delay: 0 },
      { name: 'York',           lon: -1.080, lat: 53.961, side: 'left',  delay: 1 },
      { name: 'Great Yarmouth', lon:  1.728, lat: 52.608, side: 'right', delay: 2 },
      { name: 'London',         lon: -0.118, lat: 51.509, side: 'right', delay: 3 },
    ];

    function adjustForUKAspect(geojson, centralLat) {
      const k = Math.cos((centralLat * Math.PI) / 180);
      function tx(coords) {
        if (typeof coords[0] === 'number') return [coords[0] * k, coords[1]];
        return coords.map(tx);
      }
      return {
        type: 'FeatureCollection',
        features: geojson.features.map((f) => ({
          type: 'Feature',
          properties: f.properties,
          geometry: { type: f.geometry.type, coordinates: tx(f.geometry.coordinates) },
        })),
      };
    }

    async function renderCoverMap() {
      const svgEl  = document.getElementById('cover-map-svg');
      const loadEl = document.getElementById('cover-map-loading');
      if (!svgEl || typeof d3 === 'undefined') return;

      let geo;
      try {
        geo = await d3.json(MAP_URL);
      } catch (err) {
        if (loadEl) loadEl.textContent = 'Map data unavailable';
        return;
      }
      const centralLat = 54.5;
      const k = Math.cos((centralLat * Math.PI) / 180);
      geo = adjustForUKAspect(geo, centralLat);

      const VW = 560, VH = 640;
      const projection = d3.geoIdentity().reflectY(true).fitExtent([[18, 18], [VW - 18, VH - 18]], geo);
      const pathGen = d3.geoPath(projection);

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      // ---- defs: gradients + filter ----
      const defs = svg.append('defs');
      const landGrad = defs.append('linearGradient')
        .attr('id', 'cover-land-gradient')
        .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
      landGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1d2a40');
      landGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10182a');

      const floodGrad = defs.append('radialGradient').attr('id', 'cover-flood-grad');
      floodGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(124, 198, 255, 0.55)');
      floodGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(77, 171, 255, 0.0)');

      // Glow filter for flooded districts
      const glow = defs.append('filter').attr('id', 'cover-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
      glow.append('feGaussianBlur').attr('stdDeviation', '2.4').attr('result', 'b');
      const merge = glow.append('feMerge');
      merge.append('feMergeNode').attr('in', 'b');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      // ---- Land layer ----
      const counts = geo.features.map(f => +f.properties[COUNT_FIELD] || 0);
      const maxCount = d3.max(counts) || 1;

      svg.append('g').attr('class', 'cover-map-land-layer')
        .selectAll('path').data(geo.features).enter()
        .append('path')
        .attr('class', 'cover-map-land')
        .attr('d', pathGen);

      // ---- Flood-glow layer (highlight all districts with any record) ----
      const floodLayer = svg.append('g').attr('class', 'cover-map-flood-layer').attr('filter', 'url(#cover-glow)');
      floodLayer.selectAll('path')
        .data(geo.features.filter(f => (+f.properties[COUNT_FIELD] || 0) > 0))
        .enter()
        .append('path')
        .attr('class', 'cover-map-flood')
        .attr('d', pathGen)
        .attr('fill', d => {
          const v = +d.properties[COUNT_FIELD] || 0;
          const t = Math.min(1, Math.pow(v / maxCount, 0.55));
          return `rgba(77, 171, 255, ${(t * 0.45).toFixed(3)})`;
        })
        .attr('stroke', d => {
          const v = +d.properties[COUNT_FIELD] || 0;
          const t = Math.min(1, Math.pow(v / maxCount, 0.55));
          return `rgba(124, 198, 255, ${(0.18 + t * 0.55).toFixed(3)})`;
        });

      // ---- Settlement light dots (sample feature centroids) ----
      const lightLayer = svg.append('g').attr('class', 'cover-map-lights');
      geo.features.forEach((f, i) => {
        if (i % 3 !== 0) return;          // sparse pattern
        const c = pathGen.centroid(f);
        if (!isFinite(c[0]) || !isFinite(c[1])) return;
        const v = +f.properties[COUNT_FIELD] || 0;
        const r = v > 0 ? 0.9 : 0.6;
        const op = v > 0 ? 0.85 : 0.45;
        lightLayer.append('circle')
          .attr('class', 'cover-map-light')
          .attr('cx', c[0]).attr('cy', c[1]).attr('r', r)
          .attr('opacity', op);
      });

      // ---- City markers w/ pill labels ----
      const cityLayer = svg.append('g').attr('class', 'cover-map-cities-layer');
      CITIES.forEach((city) => {
        const [px, py] = projection([city.lon * k, city.lat]);
        if (!isFinite(px) || !isFinite(py)) return;

        const g = cityLayer.append('g').attr('class', `cover-map-city-marker delay-${city.delay}`);

        // Pulse rings
        g.append('circle').attr('class', 'cover-map-city-pulse').attr('cx', px).attr('cy', py).attr('r', 6);

        // Core dot
        g.append('circle').attr('class', 'cover-map-city-dot').attr('cx', px).attr('cy', py).attr('r', 3.2);

        // Label pill (positioned to the right or left of the marker)
        const label = city.name;
        const padX = 7, padY = 4;
        // Approximate text width — 11px Inter ~ 6.4px/char
        const tw = label.length * 6.4 + padX * 2;
        const th = 18;
        const offsetX = 14;
        const pillX = city.side === 'right' ? px + offsetX : px - offsetX - tw;
        const pillY = py - th / 2;

        // Leader line
        g.append('line').attr('class', 'cover-map-city-leader')
          .attr('x1', px).attr('y1', py)
          .attr('x2', city.side === 'right' ? pillX : pillX + tw).attr('y2', py);

        const pill = g.append('g').attr('class', 'cover-map-city-pill');
        pill.append('rect')
          .attr('x', pillX).attr('y', pillY)
          .attr('width', tw).attr('height', th).attr('rx', 9);
        pill.append('text')
          .attr('x', pillX + padX).attr('y', pillY + th / 2 + 4)
          .text(label);
      });

      // Hide loader
      if (loadEl) {
        loadEl.classList.add('is-hidden');
        setTimeout(() => loadEl.remove(), 600);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderCoverMap);
    } else {
      renderCoverMap();
    }

    /* ============================================================
       CITY CAROUSEL — slide transitions + per-city dark map render
       ============================================================ */
    const CAROUSEL = document.getElementById('city-carousel');
    if (CAROUSEL) {
      const track = CAROUSEL.querySelector('.city-carousel-track');
      const slides = CAROUSEL.querySelectorAll('.city-slide');
      const dots = CAROUSEL.querySelectorAll('.city-carousel-dot');
      const prevBtn = CAROUSEL.querySelector('.city-carousel-nav.prev');
      const nextBtn = CAROUSEL.querySelector('.city-carousel-nav.next');
      const total = slides.length;
      let idx = 0;

      function go(i) {
        idx = (i + total) % total;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, k) => d.classList.toggle('is-active', k === idx));
        CAROUSEL.dataset.active = String(idx);
      }

      prevBtn && prevBtn.addEventListener('click', () => go(idx - 1));
      nextBtn && nextBtn.addEventListener('click', () => go(idx + 1));
      dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.index)));

      // Keyboard arrows when carousel has focus
      CAROUSEL.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); go(idx - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      });
      CAROUSEL.tabIndex = 0;
    }

    /* ---- Per-city mini dark map ---- */
    const CITY_MATCHERS = {
      Hull:           f => /Kingston upon Hull|Hull/i.test(f.properties[NAME_FIELD] || ''),
      York:           f => /^York$/i.test(f.properties[NAME_FIELD] || ''),
      GreatYarmouth:  f => /Great Yarmouth/i.test(f.properties[NAME_FIELD] || ''),
      // Greater London = bbox filter (lon -0.51..0.33, lat 51.28..51.69)
      London:         null,
    };
    const LONDON_BBOX = { lonMin: -0.51, lonMax: 0.33, latMin: 51.28, latMax: 51.69 };

    function bboxCentroid(coords) {
      // Find rough centroid via bbox of coordinates
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      function walk(c) {
        if (typeof c[0] === 'number') {
          if (c[0] < xMin) xMin = c[0];
          if (c[0] > xMax) xMax = c[0];
          if (c[1] < yMin) yMin = c[1];
          if (c[1] > yMax) yMax = c[1];
        } else { c.forEach(walk); }
      }
      walk(coords);
      return [(xMin + xMax) / 2, (yMin + yMax) / 2];
    }

    async function renderCitySlides() {
      const svgs = document.querySelectorAll('.city-slide-svg');
      if (!svgs.length || typeof d3 === 'undefined') return;

      let geo;
      try { geo = await d3.json(MAP_URL); }
      catch (_) { return; }

      const centralLat = 54.5;
      const k = Math.cos((centralLat * Math.PI) / 180);
      geo = adjustForUKAspect(geo, centralLat);

      svgs.forEach((svgEl) => {
        const cityKey = svgEl.dataset.citySvg;

        // Resolve subset of features for this city
        let subset;
        if (cityKey === 'London') {
          // Pre-adjusted lon, so multiply bbox lons by k
          subset = geo.features.filter((f) => {
            const c = bboxCentroid(f.geometry.coordinates);
            const lonAdj = c[0]; // already scaled
            const lat = c[1];
            return lonAdj >= LONDON_BBOX.lonMin * k && lonAdj <= LONDON_BBOX.lonMax * k &&
                   lat    >= LONDON_BBOX.latMin     && lat    <= LONDON_BBOX.latMax;
          });
        } else {
          const matcher = CITY_MATCHERS[cityKey];
          subset = matcher ? geo.features.filter(matcher) : [];
        }
        if (!subset.length) return;

        // Build a FeatureCollection of just this subset for fitExtent
        const subsetFC = { type: 'FeatureCollection', features: subset };

        // Pad: include neighbouring features for visual context (within bbox + buffer)
        const subsetBBox = (() => {
          let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
          subset.forEach((f) => {
            const c = bboxCentroid(f.geometry.coordinates);
            // use full bbox of the feature
            (function walk(coords) {
              if (typeof coords[0] === 'number') {
                if (coords[0] < xMin) xMin = coords[0];
                if (coords[0] > xMax) xMax = coords[0];
                if (coords[1] < yMin) yMin = coords[1];
                if (coords[1] > yMax) yMax = coords[1];
              } else { coords.forEach(walk); }
            })(f.geometry.coordinates);
          });
          const padX = (xMax - xMin) * 0.55 || 0.4;
          const padY = (yMax - yMin) * 0.55 || 0.4;
          return [xMin - padX, yMin - padY, xMax + padX, yMax + padY];
        })();

        const contextFeatures = geo.features.filter((f) => {
          const c = bboxCentroid(f.geometry.coordinates);
          return c[0] >= subsetBBox[0] && c[0] <= subsetBBox[2] &&
                 c[1] >= subsetBBox[1] && c[1] <= subsetBBox[3];
        });

        const VW = 480, VH = 280;
        const projection = d3.geoIdentity().reflectY(true)
          .fitExtent([[16, 16], [VW - 16, VH - 16]], subsetFC);
        const pathGen = d3.geoPath(projection);

        const svg = d3.select(svgEl);
        svg.selectAll('*').remove();

        // Context (neighbour) layer — dim
        svg.append('g').selectAll('path')
          .data(contextFeatures)
          .enter().append('path')
          .attr('class', 'city-la')
          .attr('d', pathGen);

        // Target (subset) layer — highlighted
        svg.append('g').selectAll('path')
          .data(subset)
          .enter().append('path')
          .attr('class', 'city-la is-target')
          .attr('d', pathGen);

        // Flood glow — features in subset that have polygon_count > 0
        svg.append('g').selectAll('path')
          .data(subset.filter(f => (+f.properties[COUNT_FIELD] || 0) > 0))
          .enter().append('path')
          .attr('class', 'city-flood')
          .attr('d', pathGen)
          .attr('fill', d => {
            const v = +d.properties[COUNT_FIELD] || 0;
            const t = Math.min(1, Math.pow(v / 200, 0.55));
            return `rgba(77, 171, 255, ${(t * 0.45).toFixed(3)})`;
          });

        // City center marker (computed from subset bbox, not centroid of geometry)
        const subsetBBoxTight = (() => {
          let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
          subset.forEach((f) => {
            (function walk(coords) {
              if (typeof coords[0] === 'number') {
                if (coords[0] < xMin) xMin = coords[0];
                if (coords[0] > xMax) xMax = coords[0];
                if (coords[1] < yMin) yMin = coords[1];
                if (coords[1] > yMax) yMax = coords[1];
              } else { coords.forEach(walk); }
            })(f.geometry.coordinates);
          });
          return [(xMin + xMax) / 2, (yMin + yMax) / 2];
        })();
        const [mx, my] = projection(subsetBBoxTight);
        if (isFinite(mx) && isFinite(my)) {
          const mg = svg.append('g').attr('class', 'city-marker');
          mg.append('circle').attr('class', 'city-marker-pulse').attr('cx', mx).attr('cy', my).attr('r', 8);
          mg.append('circle').attr('class', 'city-marker-core').attr('cx', mx).attr('cy', my).attr('r', 3.6);
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderCitySlides);
    } else {
      renderCitySlides();
    }
  })();

/* ============================================================
     STANDALONE PRICE TREND CHART
     Data: ../CASA0029_project/data/flood_price_compare_precomputed.json
     ============================================================ */
  (function () {
    const ZONE_CFG = [
      { key: 'FZ3',      color: '#ef4444', label: 'Zone 3' },
      { key: 'FZ2',      color: '#f59e0b', label: 'Zone 2' },
      { key: 'no_flood', color: '#3b82f6', label: 'No flood' },
    ];

    const DATA_URLS = [
      '../CASA0029_project/data/price_trend_by_zone.json',
      'https://raw.githubusercontent.com/Levine-l/CASA0029_project/main/data/price_trend_by_zone.json',
    ];

    let trendData = null;
    let activeTrendKey = 'london';

    async function loadTrendData() {
      for (const url of DATA_URLS) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          trendData = await r.json();
          return;
        } catch (e) { /* try next */ }
      }
    }

    function drawTrend(trendKey) {
      const titleEl    = document.getElementById('outer-trend-title');
      const subtitleEl = document.getElementById('outer-trend-subtitle');
      const emptyEl    = document.getElementById('outer-trend-empty');
      const wrapEl     = document.getElementById('outer-canvas-wrap');
      const canvas     = document.getElementById('outer-trend-canvas');
      const btnEl      = document.querySelector(
        '.outer-city-btn[data-trend-key="' + trendKey + '"]');
      const cityLabel  = btnEl ? btnEl.dataset.cityLabel : trendKey;

      titleEl.textContent    = cityLabel + ' · Price / m² Trend';
      subtitleEl.textContent = cityLabel + ' · Median GBP/m² by flood zone';

      const cityData = trendData && trendData.cities && trendData.cities[trendKey];
      if (!cityData) {
        canvas.style.display = 'none';
        emptyEl.style.display = '';
        emptyEl.textContent = trendData ? 'No data for this city.' : 'Data failed to load.';
        return;
      }
      canvas.style.display = '';
      emptyEl.style.display = 'none';
      _drawCanvas(canvas, wrapEl, cityData);
    }

    function _drawCanvas(canvas, wrap, cityData) {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap.clientWidth || 700;
      const cssH = 240;
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width  = cssW + 'px';
      canvas.style.height = cssH + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      const P = { top: 14, right: 12, bottom: 30, left: 52 };
      const cW = cssW - P.left - P.right;
      const cH = cssH - P.top  - P.bottom;
      const years = cityData.years;

      const allVals = [];
      for (const zc of ZONE_CFG) {
        (cityData[zc.key] || []).forEach(v => { if (v != null) allVals.push(v); });
      }
      if (!allVals.length) return;

      const rawMin = Math.min(...allVals);
      const rawMax = Math.max(...allVals);
      const vpad   = (rawMax - rawMin) * 0.12 || rawMax * 0.1;
      const yMin   = Math.max(0, rawMin - vpad);
      const yMax   = rawMax + vpad;
      const xMin   = years[0];
      const xMax   = years[years.length - 1];

      function xp(yr)  { return P.left + (yr - xMin) / (xMax - xMin) * cW; }
      function yp(val) { return P.top  + (1 - (val - yMin) / (yMax - yMin)) * cH; }

      // Y gridlines + labels
      for (let i = 0; i <= 5; i++) {
        const v = yMin + (yMax - yMin) * i / 5;
        const y = yp(v);
        ctx.strokeStyle = 'rgba(107,154,196,0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(P.left, y); ctx.lineTo(P.left + cW, y); ctx.stroke();
        ctx.fillStyle = '#5b6b82';
        ctx.font = '11px Inter,system-ui,sans-serif';
        ctx.textAlign = 'right';
        const lbl = v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k' : Math.round(v).toString();
        ctx.fillText(lbl, P.left - 6, y + 4);
      }

      // X baseline
      ctx.strokeStyle = 'rgba(107,154,196,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(P.left, P.top + cH); ctx.lineTo(P.left + cW, P.top + cH); ctx.stroke();

      // X labels
      const step = years.length > 14 ? 4 : years.length > 8 ? 3 : 2;
      ctx.fillStyle = '#5b6b82';
      ctx.font = '11px Inter,system-ui,sans-serif';
      ctx.textAlign = 'center';
      years.forEach((yr, i) => {
        if (i % step !== 0 && i !== years.length - 1) return;
        ctx.fillText(String(yr), xp(yr), P.top + cH + 20);
      });

      // Zone lines + dots
      for (const zc of ZONE_CFG) {
        const vals = cityData[zc.key];
        if (!vals) continue;
        ctx.strokeStyle = zc.color;
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.lineCap  = 'round';
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        let started = false;
        years.forEach((yr, i) => {
          const v = vals[i];
          if (v == null) { started = false; return; }
          if (!started) { ctx.moveTo(xp(yr), yp(v)); started = true; }
          else ctx.lineTo(xp(yr), yp(v));
        });
        ctx.stroke();
        ctx.fillStyle = zc.color;
        ctx.globalAlpha = 0.75;
        years.forEach((yr, i) => {
          const v = vals[i];
          if (v == null) return;
          ctx.beginPath();
          ctx.arc(xp(yr), yp(v), 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1;

      canvas._outerMeta = { years, cityData, xMin, xMax, yMin, yMax, P, cW, cH };
    }

    function initTooltip() {
      const canvas = document.getElementById('outer-trend-canvas');
      const vline  = document.getElementById('outer-vline');
      const tt     = document.getElementById('outer-tt');
      const wrap   = document.getElementById('outer-canvas-wrap');

      canvas.addEventListener('mousemove', e => {
        const m = canvas._outerMeta;
        if (!m) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const { years, cityData, xMin, xMax, P, cW } = m;
        if (mx < P.left || mx > P.left + cW) {
          vline.style.display = 'none'; tt.style.display = 'none'; return;
        }
        const frac = (mx - P.left) / cW;
        const idx  = Math.min(years.length - 1, Math.max(0, Math.round(frac * (years.length - 1))));
        const yr   = years[idx];
        const xPx  = P.left + (yr - xMin) / (xMax - xMin) * cW;

        vline.style.left    = xPx + 'px';
        vline.style.display = 'block';

        let html = '<span style="font-weight:700;color:#f1f5f9">' + yr + '</span>';
        for (const zc of ZONE_CFG) {
          const v = cityData[zc.key] && cityData[zc.key][idx];
          if (v == null) continue;
          html += '<br><span style="color:' + zc.color + '">' + zc.label + '</span>: £' + Math.round(v).toLocaleString('en-GB') + '/m²';
        }
        tt.innerHTML    = html;
        tt.style.display = 'block';
        const wrapW = wrap.clientWidth;
        const ttW   = tt.offsetWidth || 130;
        tt.style.left = (xPx + 10 + ttW > wrapW ? xPx - ttW - 10 : xPx + 10) + 'px';
        tt.style.top  = '6px';
      });
      canvas.addEventListener('mouseleave', () => {
        vline.style.display = 'none'; tt.style.display = 'none';
      });
    }

    (async () => {
      // City tab click handlers (manual)
      document.getElementById('outer-city-tabs').addEventListener('click', e => {
        const btn = e.target.closest('.outer-city-btn');
        if (!btn) return;
        document.querySelectorAll('.outer-city-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTrendKey = btn.dataset.trendKey;
        drawTrend(activeTrendKey);
      });

      // Sync with iframe navigate buttons via postMessage
      window.addEventListener('message', e => {
        if (!e.data || e.data.type !== 'cityChange') return;
        const key = e.data.trendKey;
        const btn = document.querySelector('.outer-city-btn[data-trend-key="' + key + '"]');
        if (!btn) return;
        document.querySelectorAll('.outer-city-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTrendKey = key;
        if (trendData) drawTrend(activeTrendKey);
      });

      // Redraw on window resize
      window.addEventListener('resize', () => {
        if (trendData) drawTrend(activeTrendKey);
      });

      initTooltip();

      await loadTrendData();
      drawTrend(activeTrendKey);
    })();
  })();
