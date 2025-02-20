# WebSocket Message App

## Installation and Running Instructions

### 1. Start MongoDB
```
Make sure MongoDB is installed and running as a replica set.
Start MongoDB (if required)
mongod --dbpath "<path_to_data>" --replSet rs0
Then, in another terminal, initiate the replica set:
mongosh
> rs.initiate()
```
### 2. Start the server
```
cd server && npm install && npm run dev

The server will start at http://localhost:3001
```
### 3. Start the client
```
cd client && npm install && npm start

The client will start at http://localhost:3000
```