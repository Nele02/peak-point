export const seedData = {
  users: {
    _model: "User",
    homer: { firstName: "Homer", lastName: "Simpson", email: "homer@simpson.com", password: "secret" },
    marge: { firstName: "Marge", lastName: "Simpson", email: "marge@simpson.com", password: "secret" },
    bart: { firstName: "Bart", lastName: "Simpson", email: "bart@simpson.com", password: "secret" },
  },

  categories: {
    _model: "Category",
    alps: { name: "Alps" },
    harz: { name: "Harz Mountains" },
    taunus: { name: "Taunus Mountains" },
    bavarianForest: { name: "Bavarian Forest" },
    blackForest: { name: "Black Forest" },
    berchtesgaden: { name: "Berchtesgaden Alps" },
  },

  peaks: {
    _model: "Peak",

    // Alps
    zugspitze: {
      name: "Zugspitze",
      description: "Highest peak in Germany (Wetterstein Alps) — iconic summit with glacier views.",
      lat: 47.42123,
      lng: 10.98632,
      elevation: 2962,
      categories: "->categories.alps",
      userid: "->users.homer",
      images: [
        {
          url: "https://res.cloudinary.com/docka7fqw/image/upload/v1767478156/awjcy0zodimq6igxtomf.jpg",
          publicId: "awjcy0zodimq6igxtomf",
        },
        {
          url: "https://res.cloudinary.com/docka7fqw/image/upload/v1767478156/hsramb8dwcj4uyzaqnt5.jpg",
          publicId: "hsramb8dwcj4uyzaqnt5",
        },
      ],
    },

    nebelhorn: {
      name: "Nebelhorn",
      description: "Allgäu Alps classic viewpoint near Oberstdorf with huge panorama.",
      lat: 47.42188,
      lng: 10.34229,
      elevation: 2224,
      categories: "->categories.alps",
      userid: "->users.homer",
      images: [],
    },

    wendelstein: {
      name: "Wendelstein",
      description: "Bavarian Pre-Alps — accessible via cable car/rack railway, great for day trips.",
      lat: 47.7035,
      lng: 12.01201,
      elevation: 1837,
      categories: "->categories.alps",
      userid: "->users.homer",
      images: [],
    },

    kampenwand: {
      name: "Kampenwand",
      description: "Chiemgau Alps — famous ridge with views over Chiemsee.",
      lat: 47.75552,
      lng: 12.36419,
      elevation: 1668,
      categories: "->categories.alps",
      userid: "->users.homer",
      images: [],
    },

    // Berchtesgaden Alps
    watzmann: {
      name: "Watzmann",
      description: "Legendary massif in Berchtesgaden National Park (Mittelspitze).",
      lat: 47.55443,
      lng: 12.92203,
      elevation: 2712,
      categories: ["->categories.alps", "->categories.berchtesgaden"],
      userid: "->users.homer",
      images: [],
    },

    hochkalter: {
      name: "Hochkalter",
      description: "Rocky classic in the Berchtesgaden Alps — impressive north face and Blaueis area.",
      lat: 47.56936,
      lng: 12.86578,
      elevation: 2607,
      categories: ["->categories.alps", "->categories.berchtesgaden"],
      userid: "->users.homer",
      images: [],
    },

    jenner: {
      name: "Jenner",
      description: "Berchtesgaden Alps — panoramic peak above Königssee (cable car access).",
      lat: 47.57582,
      lng: 13.02097,
      elevation: 1874,
      categories: ["->categories.alps", "->categories.berchtesgaden"],
      userid: "->users.homer",
      images: [],
    },

    // Harz Mountains
    brocken: {
      name: "Brocken",
      description: "Harz highest peak — moody weather, classic hiking + Brockenbahn vibe.",
      lat: 51.799157,
      lng: 10.615561,
      elevation: 1141,
      categories: "->categories.harz",
      userid: "->users.homer",
      images: [],
    },

    wurmberg: {
      name: "Wurmberg",
      description: "Second-highest in the Harz — popular for hiking and winter sports.",
      lat: 51.756642,
      lng: 10.618413,
      elevation: 971,
      categories: "->categories.harz",
      userid: "->users.homer",
      images: [],
    },

    // Taunus
    grosserFeldbergTaunus: {
      name: "Großer Feldberg (Taunus)",
      description: "Highest peak in the Taunus — quick escape from Frankfurt/Rhein-Main.",
      lat: 50.232042,
      lng: 8.457343,
      elevation: 879,
      categories: "->categories.taunus",
      userid: "->users.homer",
      images: [],
    },

    altkoenig: {
      name: "Altkönig",
      description: "Taunus ridge classic — forest trails + historic ramparts.",
      lat: 50.216667,
      lng: 8.483333,
      elevation: 798,
      categories: "->categories.taunus",
      userid: "->users.homer",
      images: [],
    },

    // Bavarian Forest
    grosserArber: {
      name: "Großer Arber",
      description: "Highest peak in the Bavarian Forest — ‘King of the Bavarian Forest’.",
      lat: 49.11247,
      lng: 13.13597,
      elevation: 1456,
      categories: "->categories.bavarianForest",
      userid: "->users.homer",
      images: [],
    },

    kleinerArber: {
      name: "Kleiner Arber",
      description: "Bavarian Forest — rugged summit close to Großer Arber.",
      lat: 49.11326,
      lng: 13.1101,
      elevation: 1384,
      categories: "->categories.bavarianForest",
      userid: "->users.homer",
      images: [],
    },

    grosserRachel: {
      name: "Großer Rachel",
      description: "Bavarian Forest National Park highlight — wild, remote feel.",
      lat: 48.97834,
      lng: 13.38911,
      elevation: 1452,
      categories: "->categories.bavarianForest",
      userid: "->users.homer",
      images: [],
    },

    lusen: {
      name: "Lusen",
      description: "Bavarian Forest — granite blocks near the Czech border, super scenic.",
      lat: 48.93931,
      lng: 13.50661,
      elevation: 1373,
      categories: "->categories.bavarianForest",
      userid: "->users.marge",
      images: [],
    },

    // Black Forest
    feldberg: {
      name: "Feldberg (Black Forest)",
      description: "Highest peak in the Black Forest — big skies + alpine-ish feel.",
      lat: 47.87383,
      lng: 8.00371,
      elevation: 1494,
      categories: "->categories.blackForest",
      userid: "->users.bart",
      images: [],
    },

    belchen: {
      name: "Belchen",
      description: "Black Forest classic — known for gorgeous views over the Rhine valley.",
      lat: 47.82254,
      lng: 7.83311,
      elevation: 1414,
      categories: "->categories.blackForest",
      userid: "->users.homer",
      images: [],
    },

    herzogenhorn: {
      name: "Herzogenhorn",
      description: "One of the highest Black Forest peaks — great for long hikes and quiet trails.",
      lat: 47.835,
      lng: 8.01944,
      elevation: 1415,
      categories: "->categories.blackForest",
      userid: "->users.homer",
      images: [],
    },

    schauinsland: {
      name: "Schauinsland",
      description: "Near Freiburg — popular day-trip mountain with wide views.",
      lat: 47.906664,
      lng: 7.892997,
      elevation: 1284,
      categories: "->categories.blackForest",
      userid: "->users.bart",
      images: [],
    },

    // no category
    grosserInselsberg: {
      name: "Großer Inselsberg",
      description: "Thuringian Forest landmark — intentionally uncategorized in this seed.",
      lat: 50.851246,
      lng: 10.465513,
      elevation: 916,
      categories: [],
      userid: "->users.homer",
      images: [],
    },

    koenigstuhlHeidelberg: {
      name: "Königstuhl (Heidelberg)",
      description: "Odenwald hill above Heidelberg — viewpoint & forest trails.",
      lat: 49.398217,
      lng: 8.7258024,
      elevation: 568,
      categories: [],
      userid: "->users.homer",
      images: [],
    },

    wasserkuppe: {
      name: "Wasserkuppe",
      description: "Rhön — famous for gliding, wide plateau.",
      lat: 50.498167,
      lng: 9.937044,
      elevation: 950,
      categories: [],
      userid: "->users.homer",
      images: [],
    },
  },
};
