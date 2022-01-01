const gplay = require("google-play-scraper");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");

async function scrapeComments(bundleId, numOfComments, sort) {
  return new Promise((resolve, reject) => {
    // This example will return 3000 reviews
    // on a single call
    gplay
      .reviews({
        appId: bundleId,
        sort: sort,
        num: numOfComments,
      })
      .then((data, arg2) => {
        resolve(data.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function generateCommentsJSON(bundleId, numOfComments, sort) {
  let gplaySort;
  if (sort === "HELPFULNESS") {
    gplaySort = gplay.sort.HELPFULNESS;
  } else if (sort === "NEWEST") {
    gplaySort = gplay.sort.NEWEST;
  } else if (sort === "RATING") {
    gplaySort = gplay.sort.NEWEST;
  } else {
    gplaySort = gplay.sort.NEWEST;
  }
  return new Promise(async (resolve, reject) => {
    const comments = [];
    try {
      const result = await scrapeComments(bundleId, numOfComments, gplaySort);
      for (comment of result) {
        comments.push(comment);
      }
    } catch (err) {
      reject(err);
    }
    resolve(comments);
  });
}

function createCSVFile(dir, fileName, data) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const csvWirter = createCsvWriter({
    path: `${dir}/${fileName}`,
    header: [
      { id: "id", title: "Id" },
      { id: "userName", title: "UserName" },
      { id: "userImage", title: "UserURL" },
      { id: "version", title: "Version" },
      { id: "score", title: "Score" },
      { id: "title", title: "Title" },
      { id: "text", title: "Text" },
      { id: "url", title: "URL" },
    ],
  });

  csvWirter
    .writeRecords(data)
    .then(() =>
      console.log(`The CSV file was written successfully at ${dir}/${fileName}`)
    );
}

async function collectPlaystoreComments(appName, bundleId, numOfComments) {
  const recentComments = await generateCommentsJSON(
    bundleId,
    numOfComments,
    "NEWEST"
  );
  const helpfulComments = await generateCommentsJSON(
    bundleId,
    numOfComments,
    "HELPFULNESS"
  );
  const ratingComments = await generateCommentsJSON(
    bundleId,
    numOfComments,
    "RATING"
  );
  createCSVFile(`./comments/${appName}`, `recents.csv`, recentComments);
  createCSVFile(`./comments/${appName}`, `helpfuls.csv`, helpfulComments);
  createCSVFile(`./comments/${appName}`, `ratings.csv`, ratingComments);
}

async function main() {
  collectPlaystoreComments("AnyApp", "com.mojang.minecraftpe", 10, "RATING");
}

// arg1 => name of directory which will contain csv files
// arg2 => app bundle id
// arg3 => number of comments upto 3000
// collectPlaystoreComments(arg1, arg2, arg3)

// arg1 => bundle id
// arg2 => number of comments upto 3000
// arg3 => sort, HELPFULNESS | RATING | NEWEST

// const helpfulComments = await generateCommentsJSON(
//   arg1,
//   arg2,
//   arg3
// );

module.exports = {
  collectPlaystoreComments,
  generateCommentsJSON,
};
