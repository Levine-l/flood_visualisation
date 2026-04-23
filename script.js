(() => {
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

  const tooltip = document.getElementById("tooltip");
  const errorBanner = document.getElementById("error-banner");

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
      const panel = grid.append("div").attr("class", "panel");
      const cityData = grouped[city];
      const total = d3.sum(cityData, (d) => d.event_count);

      const years = cityData.map((d) => d.year);
      const xDomain = years.length ? [d3.min(years) - 1, d3.max(years) + 1] : [2000, 2020];

      panel.append("div").attr("class", "panel-header").html(`
        <h2 class="panel-title">${CITY_DISPLAY[city]}</h2>
        <span class="panel-meta"><span class="meta-value">${total}</span> events</span>
      `);

      const seasonsPresent = SEASON_ORDER.filter((s) =>
        cityData.some((d) => d.dominant_season === s)
      );
      const legendRow = panel
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

      drawPanelChart(panel.node(), cityData, { xDomain, maxCount });
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
      ${dateRange ? `<div class="tt-row"><span class="tt-label">Dates</span><span class="tt-value">${dateRange}</span></div>` : ""}
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
    tooltip.classList.remove("visible");
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
})();
