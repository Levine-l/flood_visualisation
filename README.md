# UK Flood Explorer: Recorded Flood Events and Housing Exposure

This repository contains the main website for the CASA0029 Urban Data Visualisation group project. The project explores recorded flood events, seasonal flood patterns, and their relationship with local housing conditions across selected UK cities.

The website combines a narrative data story, D3 based charts, a UK flood record choropleth map, and an embedded Mapbox-based housing exposure map. The aim is to help users understand how flood records, flood zone exposure and housing market indicators can be viewed together as an urban analytics problem.

## Live Website

```text
https://levine-l.github.io/flood_visualisation/
```

### Project Theme

The project focuses on urban flood exposure in the UK. It asks how recorded flood events and housing-market indicators can be visualised together to support exploratory interpretation of flood risk and urban vulnerability.

The project focuses on four case-study areas:

Hull
York
Great Yarmouth
Greater London

These cities were selected because they represent different flood contexts, including surface-water flooding, river flooding, coastal flooding and multiple-source flood exposure.

### Website Structure

The website is organised as a scrolling data story:

1. Overview
Introduces the project topic and frames flooding as an urban exposure issue.
2. Flood Records
Shows recorded flood outlines across UK local authorities using a choropleth map.
3. Time Patterns
Uses D3 visualisations to compare annual and seasonal flood-event patterns across the four case-study cities.
4. Market Context
Introduces the relationship between flood risk and housing markets.
5. Housing Exposure
Embeds the interactive flood-zone and housing-price map from the companion repository.
6. Insights
Summarises the key interpretation from the visualisations.
7. Team
Presents group members and project contributions.

### Repo Structure
```text
flood_visualisation/
│
├── index.html
│   Main webpage structure and narrative sections.
│
├── style.css
│   Website styling, layout, animations and responsive design.
│
├── script.js
│   JavaScript logic for D3 charts, map interactions, scrolling effects,
│   carousel behaviour and page animations.
│
├── data/
│   Processed front-end data used by the D3 visualisations.
│
│   ├── four_city_events.csv
│   │   Processed recorded flood-event data for Hull, York,
│   │   Great Yarmouth and Greater London.
│   │
│   └── uk_flood_frequency_simplified.geojson
│       Simplified Local Authority District layer with recorded
│       flood-outline counts for the UK choropleth map.
│
├── image/
│   Image assets used in the website, including city images and
│   flood-related visual material.
│
└── README.md
    Project documentation.
```


### Data Used

The website uses processed outputs derived from the following source datasets:

| Dataset | Role in project | Source |
|---|---|---|
| Environment Agency Recorded Flood Outlines | Used to analyse historic flood records and create flood frequency maps and charts. | [Environment Agency Recorded Flood Outlines](https://environment.data.gov.uk/dataset/889885c0-4465-11e4-9507-f0def148f590) |
| Local Authority District boundaries | Used as spatial units for the UK. | [ONS Local Authority Districts May 2025 Boundaries](https://geoportal.statistics.gov.uk/datasets/ons::local-authority-districts-may-2025-boundaries-uk-bfc-v2/about) |
| Case study city boundaries | Used to extract recorded flood events for Hull, York, Great Yarmouth and Greater London. | [ONS Local Authority Districts May 2025 Boundaries](https://geoportal.statistics.gov.uk/datasets/ons::local-authority-districts-may-2025-boundaries-uk-bfc-v2/about) |
| Flood Zone 2/3 data | Used in the embedded housing exposure map. | [Environment Agency Flood Zones 2 and 3](https://environment.data.gov.uk/dataset/04532375-a198-476e-985e-0579a0a11b47) |
| HM Land Registry Price Paid Data | Used in the embedded housing price visualisation. | [HM Land Registry Price Paid Data](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) |
| House Price per Square Metre data | Used to compare housing-market indicators inside and outside flood zones. | [House Price per Square Metre in England and Wales](https://data.london.gov.uk/dataset/house-price-per-square-metre-in-england-and-wales-epo9w/) |
| OS Code-Point Open and postcode lookup data | Used to connect housing records to geographic locations. | [OS Code-Point Open](https://osdatahub.os.uk/data/downloads/open/CodePointOpen); [Postcode to OA/LSOA/MSOA/LAD Best Fit Lookup](https://open-geography-portalx-ons.hub.arcgis.com/datasets/ons::postcode-to-oa-2021-to-lsoa-to-msoa-to-lad-february-2025-best-fit-lookup-in-the-uk/about) |
| OS OpenMap Local building footprints | Used to create the 3D building context layer in the embedded map. | [OS OpenMap Local](https://osdatahub.os.uk/data/downloads/open/OpenMapLocal) |
| ONS 2021 Output Area boundaries | Used to join OA level housing-price indicators to neighbourhood scale polygons. | [ONS Output Areas December 2021 Boundaries](https://geoportal.statistics.gov.uk/datasets/ons::output-areas-december-2021-boundaries-ew-bfc-v8/about) |
