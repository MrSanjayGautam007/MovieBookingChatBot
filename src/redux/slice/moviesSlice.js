import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMoviesFromFirestore, saveBookingToFirestore, getUserBookingsFromFirestore, getTheatersFromFirestore } from '../../services/movieService';

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (_, { rejectWithValue }) => {
        try {
            // Calling the modular service function
            const movies = await getMoviesFromFirestore();
            return movies;
        } catch (error) {
            // Passing the error back to Redux state
            return rejectWithValue(error.message);
        }
    }
);

export const saveBooking = createAsyncThunk(
    'movies/saveBooking',
    async (bookingData, { rejectWithValue }) => {
        try {
            const booking = await saveBookingToFirestore(bookingData);
            return booking;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserBookings = createAsyncThunk(
    'movies/fetchUserBookings',
    async (uid, { rejectWithValue }) => {
        try {
            const bookings = await getUserBookingsFromFirestore(uid);
            return bookings;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTheaters = createAsyncThunk(
    'movies/fetchTheaters',
    async (_, { rejectWithValue }) => {
        try {
            const theaters = await getTheatersFromFirestore();
            return theaters;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const moviesSlice = createSlice({
    name: 'movies',
    initialState: {
        moviesList: [],
        bookingsList: [],
        theatersList: [],
        movieFetchLoading: false,
        bookingSaveLoading: false,
        bookingsFetchLoading: false,
        theatersFetchLoading: false,
        movieStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        userBookingStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed',
        theatreStatus: 'idle',
        error: null,
        userBookingRefreshLoading: false,
    },
    reducers: {
        refreshUserBookingsLoading: (state, action) => {
            state.userBookingRefreshLoading = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Movies
            .addCase(fetchMovies.pending, (state) => {
                state.movieFetchLoading = true;
                state.movieStatus = 'loading';
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.movieFetchLoading = false;
                state.moviesList = action.payload;
                state.movieStatus = 'succeeded';
                // console.log("Data received from Firebase:", action.payload);
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.movieFetchLoading = false;
                state.error = action.error.message;
                state.movieStatus = 'failed';
            })
            // Save Booking
            .addCase(saveBooking.pending, (state) => {
                state.bookingSaveLoading = true;
            })
            .addCase(saveBooking.fulfilled, (state) => {
                state.bookingSaveLoading = false;
            })
            .addCase(saveBooking.rejected, (state, action) => {
                state.bookingSaveLoading = false;
                state.error = action.error.message;
            })
            // Fetch User Bookings
            .addCase(fetchUserBookings.pending, (state) => {
                state.bookingsFetchLoading = true;
                state.userBookingStatus = 'loading';
            })
            .addCase(fetchUserBookings.fulfilled, (state, action) => {
                state.bookingsFetchLoading = false;
                state.bookingsList = action.payload;
                state.userBookingStatus = 'succeeded'
            })
            .addCase(fetchUserBookings.rejected, (state, action) => {
                state.bookingsFetchLoading = false;
                state.error = action.error.message;
                state.userBookingStatus = 'failed';
            })
            // Fetch Theaters
            .addCase(fetchTheaters.pending, (state) => {
                state.theatersFetchLoading = true;
                state.theatreStatus = 'loading';
            })
            .addCase(fetchTheaters.fulfilled, (state, action) => {
                state.theatersFetchLoading = false;
                state.theatersList = action.payload;
                state.theatreStatus = 'succeeded';
            })
            .addCase(fetchTheaters.rejected, (state, action) => {
                state.theatersFetchLoading = false;
                state.error = action.error.message;
                state.theatreStatus = 'failed';
            });
    },
});

export const { refreshUserBookingsLoading } = moviesSlice.actions;
export default moviesSlice.reducer;