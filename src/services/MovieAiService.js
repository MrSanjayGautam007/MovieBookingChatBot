
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from '@env';
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue } from '@react-native-firebase/remote-config';
import logger from '../utilities/logger';
// --- 1. MODULAR DATA LOGIC (Add your logic here) ---
export const fetchMoviesFromDB = async (genre) => {
    try {
        const db = getFirestore();
        const moviesCol = collection(db, 'movies');
        const q = query(moviesCol, where('genre', 'array-contains', genre));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            title: doc.data().title,
            rating: doc.data().rating
        }));
    } catch (error) {
        logger.error("DB Fetch Error:", error);
        throw error;
    }
};
export const fetchShowtimesFromDB = async (movieTitle) => {
    try {
        const db = getFirestore();
        const showtimesCol = collection(db, 'showtimes');
        const q = query(showtimesCol, where('movieTitle', '==', movieTitle));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        logger.error("Showtimes Fetch Error:", error);
        throw error;
    }
};

// new helper to fetch all movies regardless of genre
export const fetchAllMovies = async () => {
    try {
        const db = getFirestore();
        const moviesCol = collection(db, 'movies');
        const querySnapshot = await getDocs(moviesCol);
        return querySnapshot.docs.map(doc => ({
            title: doc.data().title,
            rating: doc.data().rating,
            image: doc.data().image,
            genre: doc.data().genre,
            id: doc.id
        }));
    } catch (error) {
        logger.error("Fetch All Movies Error:", error);
        throw error;
    }
};

// --- 2. EXPANDED MODULAR TOOL DEFINITIONS ---
const movieTools = {
    functionDeclarations: [
        {
            name: "fetchMoviesByGenre",
            description: "Search for movies in our database by genre.",
            parameters: {
                type: "object",
                properties: { genre: { type: "string", description: "The genre, e.g., Action" } },
                required: ["genre"],
            },
        },
        {
            name: "getMovieShowtimes",
            description: "Get specific showtimes for a movie title.",
            parameters: {
                type: "object",
                properties: { movieTitle: { type: "string" } },
                required: ["movieTitle"],
            },
        },
        {
            name: "findTheaters",
            description: "Find local theaters currently showing a specific movie.",
            parameters: {
                type: "object",
                properties: {
                    movieTitle: { type: "string" },
                    location: { type: "string", description: "City or zip code" }
                },
                required: ["movieTitle"],
            },
        },
        {
            name: "checkSeatAvailability",
            description: "Check if there are available seats for a specific showtime.",
            parameters: {
                type: "object",
                properties: {
                    theaterId: { type: "string" },
                    movieTitle: { type: "string" },
                    time: { type: "string", description: "Format HH:MM" }
                },
                required: ["theaterId", "movieTitle", "time"],
            },
        },
        {
            name: "fetchAllMovies",
            description: "Retrieve a list of all movies available in the system.",
            parameters: {
                type: "object",
                properties: {},
            },
        }
    ],
};

// --- 3. MODULAR INITIALIZER ---
export const startAiChat = async () => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const config = getRemoteConfig();
    await fetchAndActivate(config);
    const modelName = getValue(config, 'gemini_model_name').asString() || 'gemini-1.5-flash';
    logger.log('Model Name', modelName);

    const model = genAI.getGenerativeModel({
        model: modelName,
        tools: [movieTools],
        systemInstruction: "You are a movie bot. Use your tools to help users find movies, theaters, showtimes, and check seat availability. " +
            "If the user asks to see all available movies or says 'show me all movies', call the function fetchAllMovies. " +
            "For genre-specific requests use fetchMoviesByGenre.",
    });

    return model.startChat({
        history: [],
        generationConfig: { maxOutputTokens: 1000 },
    });
};