

var sticky = require('sticky-session'),
    http = require('http'),
    express = require('express'),
    socketIO = require('socket.io'),
    cluster = require('cluster'),
    cpus = require('os').cpus().length

require('./config/db/db.setup')
var app = express(), io;
server = http.Server(app);
const cors = require('cors')
const routes = require('./routes/routes')
const bodyParser = require('body-parser');
const logger = require('morgan')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const compression = require('compression')

const User = require('./Models/User.model')
const Event = require('./Models/Events.model')
app.use(logger('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json())
app.use(compression())


app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 5000
    })
}));

// MOBILE  VERSION NOW USES EXPO


// // ====================PASSPORT MIDDLEWARE==========================
// PASSPORT CONFIG (VERSION 1)
// app.use(session({ secret: "anything" }))
require('./config/passport.setup.js')(app)





// // PASSPORT MIDDLEWARE (IRONHACK BOILERPLATE)
// require('./config/passport.setup.js')(app)

// PASSPORT MIDDLEWARE VERSION 2
// const passport = require('passport')    
// require('./config/passport-config')(passport)
// app.use(passport.initialize());
// app.use(passport.session());
// ====================PASSPORT MIDDLEWARE==========================



const port = 5000












io = socketIO(server);

app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers
    return next()
})

const connectedUsers = {}


io.on('connection', socket => {
    const { user } = socket.handshake.query
    connectedUsers[user] = socket.id


    socket.on('init_communication', () => {
        console.log('this is the initial communication')
        // User.find({}).select('username')
        //     .then(users => {
        //         io.sockets.emit('users', users)
        //     })
        //     .catch(err => res.json(err))

        Event.find().populate('host', 'username email')
            .populate('vehicles')
            .then(events => socket.emit('events', events))
            .catch(err => new Error(err))



        // END OF INIT_COMMUNICATION
    })
    socket.on('disconnect', () => {
        console.log(' a user disconnected')
    })
})








if (!sticky.listen(server, port)) {
    server.once('listening', function () {
        console.log('Server started on port ' + port);
    });

    if (cluster.isMaster) {
        for (let i = 0; i < cpus.length; i++) {
            cluster.fork()
        }
        console.log('Master server started on port ' + port);
    }
    cluster.on('exit', (worker) => {
        cluster.fork()
    })
}
else {
    console.log('- Child server started on port ' + port + ' case worker id=' + cluster.worker.id);
}



app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:8081", "http://localhost:19002",
    ]
}))
// app.use(cors())
app.use(routes)


