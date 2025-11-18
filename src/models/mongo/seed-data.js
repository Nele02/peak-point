export const seedData = {
  users: {
    _model: "User",
    homer: {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: "secret"
    },
    marge: {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secret"
    },
    bart: {
      firstName: "Bart",
      lastName: "Simpson",
      email: "bart@simpson.com",
      password: "secret"
    }
  },
  categories: {
    _model: "Category",
    alps: {
      name: "Alps"
    },
    harz: {
      name: "Harz Mountains"
    },
    taunus: {
      name: "Taunus Mountains"
    },
    bavarianForest: {
      name: "Bavarian Forest"
    },
    blackForest: {
      name: "Black Forest"
    },
    berchtesgaden: {
      name: "Berchtesgaden Alps"
    }
  },
  peaks: {
    _model: "Peak",
    zugspitze: {
      name: "Zugspitze",
      description: "Highest peak in Germany",
      lat: 47.4210,
      lng: 10.9850,
      elevation: 2962,
      categories: ["->categories.alps","->categories.berchtesgaden"],
      userid: "->users.homer",
      images: ["/zugspitze.jpg", "/zugspitze2.png"]
    },
    grosserArber: {
      name: "Großer Arber",
      description: "Highest peak in the Bavarian Forest",
      lat: 49.1386,
      lng: 13.1431,
      elevation: 1456,
      categories: "->categories.bavarianForest",
      userid: "->users.marge"
    },
    kleinerArber: {
      name: "Kleiner Arber",
      description: "Second highest peak in the Bavarian Forest",
      lat: 49.1300,
      lng: 13.1500,
      elevation: 1383,
      categories: "->categories.bavarianForest",
      userid: "->users.marge"
    },
    feldberg: {
      name: "Feldberg",
      description: "Highest peak in the Black Forest",
      lat: 47.8746,
      lng: 8.0046,
      elevation: 1493,
      categories: "->categories.blackForest",
      userid: "->users.bart"
    },
  }
};