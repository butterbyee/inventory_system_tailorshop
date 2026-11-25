import { createApp } from './app.js';
const {app,db}=createApp();
const port=Number(process.env.PORT || 3001);
const server=app.listen(port,'127.0.0.1',()=>console.log(`Thread & Stock API ready at http://127.0.0.1:${port} (local SQLite)`));
function stop() { server.close(()=>{db.close();process.exit(0);}); }
process.on('SIGINT',stop);process.on('SIGTERM',stop);
