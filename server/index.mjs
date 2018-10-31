import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Process from 'child_process';
import redis from 'redis';
// import Pg from 'pg';
// Components
import DataObject from './data.mjs';

const Data = new DataObject();

// const client = new Pg.Client({
//     connectionString:
//         'postgres://gxhfuabdoppgyu:82a1c144c0c80b73acbe6c10c8859e7f54837999b16ddfd2c2615bb9d2ace955@ec2-54-225-68-133.compute-1.amazonaws.com:5432/d5j5bqvt7pnmv0'
// });
// client.connect();

// Prod
const store = redis.createClient('Redis URL');
// Dev
// const store = redis.createClient('redis://localhost:6379');
// const store = redis.createClient('redis://172.17.0.2:6379');

store.on('error', (err) => {
    console.log('🚨 ', err.message);
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));
app.post('/model', async (req, res) => {
    if (req.body) {
        const data = await Data.get(req.body.query);
        if (data !== null) {
            store.set('data', JSON.stringify(data));
            const sh = async (cmd) => {
                return new Promise(function(resolve, reject) {
                    Process.exec(cmd, (err, stdout, stderr) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ stdout, stderr });
                        }
                    });
                });
            };
            await sh('python3 ./ml/main.py')
                .then((output) => {
                    console.log(output.stdout);
                    store.get('result', (err, reply) => {
                        res.json(reply);
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            res.json('[No Data]');
        }
    } else {
        res.statusCode = 400;
        res.end();
    }
});
app.get('*', (req, res) => {
    res.statusCode = 404;
    res.end();
});

app.listen(process.env.PORT || 8080, () =>
    console.log(`App Server Ready! Port: ${process.env.PORT | 8080}`)
);
