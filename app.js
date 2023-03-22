const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDbObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
 SELECT
 movie_name
 FROM
 movie
 ORDER BY movie_id;`;
  const MoviesArray = await db.all(getMoviesQuery);
  response.send(
    MoviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//post APIS
app.post("/movies/", async (request, response) => {
  const MovieDetails = request.body;
  const { directorId, movieName, leadActor } = MovieDetails;
  const addMovieQuery = `INSERT INTO
movie(director_id,movie_name,lead_actor)
VALUES ('${directorId}',
'${movieName}',
'${leadActor}');`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;

  response.send("Movie Successfully Added");
});
//get API2
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//putAPI
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const MovieDetails = request.body;
  const { directorId, movieName, leadActor } = MovieDetails;
  const updateMovieQuery = `
UPDATE movie
SET director_id = '${directorId}',
movie_name = '${movieName}',
lead_actor = '${leadActor}'
WHERE movie_id = ${movieId}
`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//delAPI
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM
    movie 
    WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
//getAPI DIRECTOR
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * 
    FROM 
    director 
    ORDER BY director_id`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//get Api director movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsMovieQuery = `SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}'`;
  const DirectorMovies = await db.all(getDirectorsMovieQuery);
  response.send(DirectorMovies.map((eachMovie) => convertDbObject(eachMovie)));
});

module.exports = app;
