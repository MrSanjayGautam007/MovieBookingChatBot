import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    doc,
    onSnapshot,
    runTransaction,
} from '@react-native-firebase/firestore';

const sanitizeKeyPart = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_:-]/g, '');

export const buildShowId = ({ movieId, movieTitle, theater, date, time }) => {
    const moviePart = sanitizeKeyPart(movieId || movieTitle || 'movie');
    const theaterPart = sanitizeKeyPart(theater || 'theater');
    const datePart = sanitizeKeyPart(date || 'date');
    const timePart = sanitizeKeyPart(time || 'time');
    return `${moviePart}__${theaterPart}__${datePart}__${timePart}`;
};

export const subscribeBookedSeatsForShow = (showId, onSeats, onError) => {
    const db = getFirestore();
    const seatDocRef = doc(db, 'seat_inventory', showId);
    return onSnapshot(
        seatDocRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                onSeats([]);
                return;
            }
            const data = snapshot.data() || {};
            onSeats(Array.isArray(data.bookedSeats) ? data.bookedSeats : []);
        },
        (error) => {
            console.error('Seat subscription error:', error);
            if (onError) onError(error);
        }
    );
};

export const reserveSeatsForShow = async ({ showId, seats, bookingMeta = {} }) => {
    if (!showId || !Array.isArray(seats) || seats.length === 0) {
        throw new Error('Invalid seat reservation payload');
    }

    const db = getFirestore();
    const seatDocRef = doc(db, 'seat_inventory', showId);

    return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(seatDocRef);
        const existing = snapshot.exists() ? (snapshot.data() || {}) : {};
        const bookedSeats = Array.isArray(existing.bookedSeats) ? existing.bookedSeats : [];

        const conflicts = seats.filter((seat) => bookedSeats.includes(seat));
        if (conflicts.length > 0) {
            throw new Error(`These seats are already booked: ${conflicts.join(', ')}`);
        }

        const nextBookedSeats = [...bookedSeats, ...seats];
        transaction.set(seatDocRef, {
            bookedSeats: nextBookedSeats,
            updatedAt: serverTimestamp(),
            lastBookingMeta: {
                ...bookingMeta,
                seatCount: seats.length,
            },
        }, { merge: true });

        return nextBookedSeats;
    });
};

export const getMoviesFromFirestore = async () => {
    try {
        // 1. Get the firestore instance
        const db = getFirestore();

        // 2. Reference the collection using the modular helper
        const moviesCol = collection(db, 'movies');

        // 3. Get the documents
        const querySnapshot = await getDocs(moviesCol);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Service Layer Error:", error);
        throw error;
    }
};

export const saveBookingToFirestore = async (bookingData) => {
    try {
        const db = getFirestore();
        const bookingsCol = collection(db, 'bookings');

        const ticketId = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const docRef = await addDoc(bookingsCol, {
            ...bookingData,
            ticketId,
            createdAt: serverTimestamp(),
            status: 'confirmed'
        });

        return { id: docRef.id, ticketId, ...bookingData };
    } catch (error) {
        console.error("Booking Save Error:", error);
        throw error;
    }
};

export const getUserBookingsFromFirestore = async (uid) => {
    try {
        const db = getFirestore();
        const bookingsCol = collection(db, 'bookings');
        const q = query(bookingsCol, where('uid', '==', uid), orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Fetch Bookings Error:", error);
        throw error;
    }
};


export const getTheatersFromFirestore = async () => {
    try {
        const db = getFirestore();
        const theatersCol = collection(db, 'theaters');
        const querySnapshot = await getDocs(theatersCol);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Fetch Theaters Error:", error);
        throw error;
    }
};


export const getBookingByTicketId = async (ticketId, uid) => {
    try {
        const db = getFirestore();
        const bookingsCol = collection(db, 'bookings');
        const q = query(bookingsCol, where('ticketId', '==', ticketId), where('uid', '==', uid));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Fetch Booking Error:", error);
        throw error;
    }
};

export default {
    buildShowId,
    subscribeBookedSeatsForShow,
    reserveSeatsForShow,
    getMoviesFromFirestore,
    saveBookingToFirestore,
    getUserBookingsFromFirestore,
    getTheatersFromFirestore,
    getBookingByTicketId,
};
