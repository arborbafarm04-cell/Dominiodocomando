import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Player } from './models'; // Assuming a Player model is defined

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Authentication strategy
passport.use(new LocalStrategy((username, password, done) => {
    // Replace the following code with your actual authentication logic
    User.findOne({ username }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        if (!user.validatePassword(password)) return done(null, false);
        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Serve static files
app.use(express.static('public'));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('playerUpdate', (data) => {
        // Handle player synchronization
        Player.findById(data.playerId, (err, player) => {
            if (err) return console.error(err);
            // Update player state and emit to others
            socket.broadcast.emit('playerState', player);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
